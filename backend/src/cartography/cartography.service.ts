import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs} from 'node:fs';
import { dirname, join } from 'path';
import { arrayBuffer } from 'stream/consumers';

@Injectable()
export class CartographyService {
  private readonly cacheDir: string;
  private readonly cacheTTLMS: number;

  constructor(private readonly configService: ConfigService) {
    this.cacheDir = this.configService.get('IGN_CACHE_DIR') || 'usr/src/geoemploi/.cache/ign';
    this.cacheTTLMS = Number(this.configService.get('IGN_CACHE_TTL_MS') || 604800000,);
  }

  private validateCoord(z: number, x: number, y: number) {
    if (z < 0 || z > 19) {
      throw new BadRequestException("Niveau de zoom invalide.");
    }

    if (x < 0 || x >= 2 ** z || y < 0 || y > 2 ** z) {
      throw new BadRequestException("Coordonnées invalides.");
    }
  }

  private getTilePath(z: number, x: number, y: number) {
    return join(this.cacheDir, String(z), String(x), `${y}.png`);
  }

  private buildIngUrl(z: number, x: number, y: number) {
    const params = new URLSearchParams({
      SERVICE: 'WMTS',
      VERSION: '1.0.0',
      REQUEST: 'GetTile',
      LAYER: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
      STYLE: 'normal',
      FORMAT: 'image/png',
      TILEMATRIXSET: 'PM_0_19',
      TILEMATRIX: String(z),
      TILEROW: String(y),
      TILECOL: String(x),
    });
    return `https://data.geopf.fr/wmts?${params.toString()}`;
  }

  async getTile(z: number, x: number, y: number): Promise<{
    buffer: Buffer;
    cacheStatus: 'HIT' | 'MISS' | 'STALE';}> {
    
    this.validateCoord(z, y, x);
    const tilePath = this.getTilePath(z, x, y);
    let stateTile: Buffer | null = null;

    try {
      const stat = await fs.stat(tilePath);
      const age = Date.now() - stat.mtimeMs;
      const buffer = await fs.readFile(tilePath);

      if (age < this.cacheTTLMS) {
        return {buffer, cacheStatus: 'HIT',};
      }

      stateTile = buffer;
    } catch {

    }

    try {
      const reponse = await fetch(this.buildIngUrl(z, x, y), { signal: AbortSignal.timeout(8000)},);

      if (!reponse.ok) {
        throw new Error(`IGN RESPONSE: ${reponse.status}`);
      }

      const arrayBuf = await reponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      await fs.mkdir(dirname(tilePath), {recursive: true});

      const tmpPath = (`${tilePath}.${process.pid}.tmp`);

      await fs.writeFile(tmpPath, buffer);
      await fs.rename(tmpPath, tilePath);

      return {buffer, cacheStatus: 'MISS',};
    } catch {
      if (stateTile) {
        return {buffer: stateTile, cacheStatus: 'STALE'};
      }
    }
    throw new BadGatewayException("Le fond Ign est indisponible.");
  }
}
