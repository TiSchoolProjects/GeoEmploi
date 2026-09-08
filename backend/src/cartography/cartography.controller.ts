import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { CartographyService } from './cartography.service';
import { Public } from '../auth/decorators/public.decorator';
import type { Response } from 'express';
import { getTilesDoc } from './cartography.controller.docs';

@Controller('cartography')
export class CartographyController {
  constructor(private readonly cartographyService: CartographyService) {}

  @getTilesDoc()
  @Public()
  @Get('tiles/:z/:x/:y')
  async getTiles(@Param('z', ParseIntPipe) z: number, @Param('x', ParseIntPipe) x: number,
                 @Param('y', ParseIntPipe) y: number, @Res() response: Response,) {
    const tile = await this.cartographyService.getTile(z, x, y);

    response.setHeader(
      'Content-Type',
      'image/png',
    );

    response.setHeader(
      'Cache-Control',
      'public, max-age=86400',
    );

    response.setHeader(
      'X-Tile-Cache',
      tile.cacheStatus,
    );

    response.send(tile.buffer);}
}
