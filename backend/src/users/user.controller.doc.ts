import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateStatusDto, UpdateUserDto } from './dto/update-user.dto';

export function createDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Create a new user' }),
        ApiParam({
            name: 'createUserDto',
            type: CreateUserDto,
            description: 'Basic user information',
        }),
        ApiResponse({ status: 201, description: 'User info', type: User }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 409, description: 'Conflict', type: undefined }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get all users' }),
        ApiResponse({ status: 200, description: 'List of all registered users', type: [User] }),
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Find a user through their id' }),
        ApiParam({ name: 'id', description: 'User id' }),
        ApiResponse({ status: 200, description: 'Found user info', type: User }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

export function updateStatusDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Update user status' }),
        ApiParam({ name: 'id', description: 'User id' }),
        ApiParam({
            name: 'updateStatusDto',
            type: UpdateStatusDto,
            description: 'New user status',
        }),
        ApiResponse({ status: 200, description: 'Updated user status', type: User }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

export function updateDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Update user info' }),
        ApiParam({ name: 'id', description: 'User id' }),
        ApiParam({
            name: 'updateUserDto',
            type: UpdateUserDto,
            description: 'New user information',
        }),
        ApiResponse({ status: 200, description: 'Updated user info', type: User }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Remove user from database' }),
        ApiParam({ name: 'id', description: 'User id' }),
        ApiResponse({ status: 200, description: 'Removed user', type: DeleteResult }),
        ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
        ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

