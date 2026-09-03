import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Application } from './entities/application.entity';
import { DeleteResult } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

export function applyDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Apply to a job' }),
        ApiParam({
            name: 'createApplicationDto',
            type: CreateApplicationDto,
            description: 'Application information',
        }),
        ApiResponse({ status: 201, description: 'Application info', type: Application }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all applications' }),
        ApiResponse({ status: 200, description: 'List of all applications', type: [Application] }),
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an application through their id' }),
        ApiResponse({ status: 200, description: 'Found application info', type: Application }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}

export function findBySeekerDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an application through seeked id' }),
        ApiResponse({ status: 200, description: 'List of all applications from seeker', type: [Application] }),
        ApiResponse({ status: 404, description: 'No seeker found with given id', type: undefined })
    );
}

export function findByJobDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an application through job id' }),
        ApiResponse({ status: 200, description: 'List of all applications from employer', type: [Application] }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function updateStatusDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Archive application, making it unavailable for viewing or application' }),
        ApiParam({
            name: 'updateApplicationDto',
            type: UpdateApplicationDto,
            description: 'Application information',
        }),
        ApiResponse({ status: 200, description: 'Archived application', type: Application }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove application from database' }),
        ApiResponse({ status: 200, description: 'Removed application', type: DeleteResult }),
        ApiResponse({ status: 404, description: 'No application found with given id', type: undefined })
    );
}
