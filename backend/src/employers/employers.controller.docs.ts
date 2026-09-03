import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Employer } from './entities/employer.entity';
import { DeleteResult } from 'typeorm';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

export function createDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a new employer' }),
        ApiParam({
            name: 'createEmployerDto',
            type: CreateEmployerDto,
            description: 'Employer information',
        }),
        ApiResponse({ status: 201, description: 'Employer info', type: Employer }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all employers' }),
        ApiResponse({ status: 200, description: 'List of all registered employers', type: [Employer] }),
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find an employer through their id' }),
        ApiResponse({ status: 200, description: 'Found employer info', type: Employer }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function validateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Validate employer info and certify their profile' }),
        ApiParam({
            name: 'updateEmployerDto',
            type: UpdateEmployerDto,
            description: 'New employer information',
        }),
        ApiResponse({ status: 200, description: 'Updated employer info', type: Employer }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function updateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Update employer info' }),
        ApiParam({
            name: 'updateEmployerDto',
            type: UpdateEmployerDto,
            description: 'New employer information',
        }),
        ApiResponse({ status: 200, description: 'Updated employer info', type: Employer }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove employer from database' }),
        ApiResponse({ status: 200, description: 'Removed employer', type: DeleteResult }),
        ApiResponse({ status: 404, description: 'No employer found with given id', type: undefined })
    );
}
