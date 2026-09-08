import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { CartographyService } from './cartography.service';
import { promises as fs } from 'node:fs';

describe('CartographyService', () => {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'IGN_CACHE_DIR') return '/tmp/geoemploi-test-cache';
      if (key === 'IGN_CACHE_TTL_MS') return 1000;
      return undefined;
    }),
  };

  let service: CartographyService;

  beforeEach(() => {
    jest.restoreAllMocks();
    service = new CartographyService(configService as any);
  });

  it('refuse un niveau de zoom invalide', async () => {
    await expect(service.getTile(20, 0, 0)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retourne une tuile distante et la met en cache', async () => {
    jest.spyOn(fs, 'stat').mockRejectedValue(new Error('not found'));
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
    jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'rename').mockResolvedValue(undefined);

    const remote = Buffer.from('png');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => remote,
    }) as any;

    const result = await service.getTile(2, 1, 1);

    expect(result.cacheStatus).toBe('MISS');
    expect(result.buffer).toEqual(remote);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retourne une erreur 502 si IGN est indisponible sans cache', async () => {
    jest.spyOn(fs, 'stat').mockRejectedValue(new Error('not found'));
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as any;

    await expect(service.getTile(2, 1, 1)).rejects.toBeInstanceOf(BadGatewayException);
  });
});

