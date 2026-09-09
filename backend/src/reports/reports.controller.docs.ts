import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Report } from './entities/report.entity';

export function createDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Create a new report' }),
        ApiParam({name: 'jobId', description: 'Unique job id' }),
        ApiResponse({ status: 201, description: 'Report created', type: Report }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' }),
        ApiResponse({ status: 403, description: 'Missing permissions.' }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get all reports' }),
        ApiResponse({ status: 200, description: 'Returns all reports', type: [Report] }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' }),
        ApiResponse({ status: 403, description: 'Missing permissions.' }),
    );
}

export function resolveDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Mark a report as resolved' }),
        ApiParam({name: 'id', description: 'Unique report id' }),
        ApiResponse({ status: 200, description: 'Report closed', type: Report }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' }),
        ApiResponse({ status: 403, description: 'Missing permissions.' }),
        ApiResponse({ status: 404, description: 'No report found.' }),
    );
}
