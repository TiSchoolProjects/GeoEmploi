import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsResponseDto } from './dto/metrics-response.dto';

export function getMetricsDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get all types of metrics on a national scale' }),
        ApiResponse({ status: 200, description: 'Metrics', type: MetricsResponseDto }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
    );
}
