import { applyDecorators, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function exportJsonDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Exports all of the user data as a single json file.' }),
        ApiResponse({ status: 200, description: 'User data', type: StreamableFile }),
        ApiResponse({ status: 401, description: 'Unauthorised', type: undefined }),
        ApiResponse({ status: 404, description: 'No user found', type: undefined }),
    );
}
