import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export function createDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a new user' }),
        ApiParam({
            name: 'createUserDto',
            type: CreateUserDto,
            description: 'Basic user information',
        }),
        ApiResponse({ status: 201, description: 'User info', type: User }),
    );
}

export function findAllDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all users' }),
        ApiResponse({ status: 200, description: 'List of all registered users', type: [User] }),
    );
}

export function findbyEmailDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find a user through their email address' }),
        ApiResponse({ status: 200, description: 'Found user info', type: User }),
        ApiResponse({ status: 404, description: 'No user found with given email address', type: undefined })
    );
}

export function findOneDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Find a user through their id' }),
        ApiResponse({ status: 200, description: 'Found user info', type: User }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

export function updateDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Update user info' }),
        ApiParam({
            name: 'updateUserDto',
            type: UpdateUserDto,
            description: 'New user information',
        }),
        ApiResponse({ status: 200, description: 'Updated user info', type: User }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

export function removeDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove user from database' }),
        ApiResponse({ status: 200, description: 'Removed user', type: DeleteResult }),
        ApiResponse({ status: 404, description: 'No user found with given id', type: undefined })
    );
}

