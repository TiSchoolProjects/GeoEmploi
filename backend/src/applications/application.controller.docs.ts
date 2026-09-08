import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Application } from './entities/application.entity';
import { DeleteResult } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

export function applyDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Apply to a job' }),
        ApiParam({
            name: 'createApplicationDto',
            type: CreateApplicationDto,
            description: 'Application information',
        }),
        ApiResponse({ status: 201, description: 'Application info', type: Application }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined }),
        ApiResponse({ status: 409, description: 'Conflict', type: undefined }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get all applications' }),
        ApiResponse({ status: 200, description: 'List of all applications', type: [Application] }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Find an application through their id' }),
        ApiParam({ name: 'id', description: 'Application id' }),
        ApiResponse({ status: 200, description: 'Found application info', type: Application }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}

export function findBySeekerDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Find an application through seeker id' }),
        ApiParam({ name: 'id', description: 'Seeker id' }),
        ApiResponse({ status: 200, description: 'List of all applications from seeker', type: [Application] }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No seeker found with given id', type: undefined })
    );
}

export function findByJobDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Find an application through job id' }),
        ApiParam({ name: 'id', description: 'Job id' }),
        ApiResponse({ status: 200, description: 'List of all applications from employer', type: [Application] }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function updateStatusDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Archive application, making it unavailable for viewing or application' }),
        ApiParam({ name: 'id', description: 'Application id' }),
        ApiParam({
            name: 'updateApplicationDto',
            type: UpdateApplicationDto,
            description: 'Application information',
        }),
        ApiResponse({ status: 200, description: 'Archived application', type: Application }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Remove application from database' }),
        ApiParam({ name: 'id', description: 'Application id' }),
        ApiResponse({ status: 200, description: 'Removed application', type: DeleteResult }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}
