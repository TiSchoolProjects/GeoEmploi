import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Seeker } from './entities/seeker.entity';
import { DeleteResult } from 'typeorm';
import { CreateSeekerDto } from './dto/create-seeker.dto';
import { UpdateSeekerDto } from './dto/update-seeker.dto';

export function createDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a new seeker' }),
        ApiParam({
            name: 'createSeekerDto',
            type: CreateSeekerDto,
            description: 'Seeker information',
        }),
        ApiResponse({ status: 201, description: 'Seeker info', type: Seeker }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all seekers' }),
        ApiResponse({ status: 200, description: 'List of all registered seekers', type: [Seeker] }),
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find a seeker through their id' }),
        ApiResponse({ status: 200, description: 'Found seeker info', type: Seeker }),
        ApiResponse({ status: 404, description: 'No seeker found with given id', type: undefined })
    );
}

export function updateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Update seeker info' }),
        ApiParam({
            name: 'updateSeekerDto',
            type: UpdateSeekerDto,
            description: 'New seeker information',
        }),
        ApiResponse({ status: 200, description: 'Updated seeker info', type: Seeker }),
        ApiResponse({ status: 404, description: 'No seeker found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove seeker from database' }),
        ApiResponse({ status: 200, description: 'Removed seeker', type: DeleteResult }),
    );
}

