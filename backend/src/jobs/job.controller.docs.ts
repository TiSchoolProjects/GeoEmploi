import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Job } from './entities/job.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto } from './dto/update-job.dto';

export function createDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Create a new job' }),
        ApiParam({
            name: 'createJobDto',
            type: CreateJobDto,
            description: 'Job information',
        }),
        ApiResponse({ status: 201, description: 'Job info', type: Job }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all jobs' }),
        ApiResponse({ status: 200, description: 'List of all jobs', type: [Job] }),
    );
}

export function findAroundDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all jobs in given radius from given position' }),
        ApiQuery({ name: 'lat', description: 'Latitude' }),
        ApiQuery({ name: 'lng', description: 'Longitude' }),
        ApiQuery({ name: 'radius', description: 'Radius' }),
        ApiParam({
            name: 'searchJobDto',
            type: SearchJobDto,
            description: 'Localisation info',
        }),
        ApiResponse({ status: 200, description: 'List of all jobs in radius', type: [Job] }),
    );
}

export function findByEmployerDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all jobs posted by given employer' }),
        ApiParam({ name: 'id', description: 'Employer id' }),
        ApiResponse({ status: 200, description: 'List of all jobs from employer', type: [Job] }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function testGeocodeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Test the geocoding API' }),
        ApiQuery({ name: 'commune', description: 'Name of the municipality' }),
        ApiResponse({ status: 200, description: 'Geocoding result', type: Job }),

    )
}

export function findAdminDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Find all job offers that need their geocoding be verified' }),
        ApiResponse({ status: 200, description: 'All corresponding job offers', type: [Job] }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
    )
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an job through their id' }),
        ApiParam({ name: 'id', description: 'Job id'}),
        ApiResponse({ status: 200, description: 'Found job info', type: Job }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function updateDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Update job info' }),
        ApiParam({ name: 'id', description: 'Job id'}),
        ApiResponse({ status: 200, description: 'Updated job info', type: Job }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function archiveDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Archive job, making it unavailable for viewing or application' }),
        ApiParam({ name: 'id', description: 'Job id'}),
        ApiResponse({ status: 200, description: 'Archived job', type: Job }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Remove job from database' }),
        ApiParam({ name: 'id', description: 'Job id'}),
        ApiResponse({ status: 200, description: 'Removed job', type: DeleteResult }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function increaseViewDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Increase view by one on an offer' }),
        ApiParam({ name: 'id', description: 'Job id'}),
        ApiResponse({ status: 200, description: 'Increased view', type: UpdateResult }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}