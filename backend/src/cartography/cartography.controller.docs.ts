import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function getTilesDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get a cached tile at a given position with a given zoom' }),
        ApiParam({ name: 'z', description: 'Browser zoom'}),
        ApiParam({ name: 'x', description: 'Latitude'}),
        ApiParam({ name: 'y', description: 'Longitude'}),
        ApiResponse({ status: 200, description: 'Tile buffer', type: Buffer<ArrayBufferLike> }),
        ApiResponse({ status: 502, description: 'The IGN API is unreachable.' })
    );
}
