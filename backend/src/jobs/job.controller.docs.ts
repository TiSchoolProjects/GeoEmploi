import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Job } from './entities/job.entity';
import { DeleteResult } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto, UpdateJobDto } from './dto/update-job.dto';

export function createDoc() {
    return applyDecorators(
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
        ApiResponse({ status: 200, description: 'List of all jobs from employer', type: [Job] }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an job through their id' }),
        ApiResponse({ status: 200, description: 'Found job info', type: Job }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function archiveDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Archive job, making it unavailable for viewing or application' }),
        ApiResponse({ status: 200, description: 'Archived job', type: Job }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove job from database' }),
        ApiResponse({ status: 200, description: 'Removed job', type: DeleteResult }),
        ApiResponse({ status: 404, description: 'No job found with given id', type: undefined })
    );
}
