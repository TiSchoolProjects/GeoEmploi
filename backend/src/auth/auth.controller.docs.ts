import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, getSchemaPath } from '@nestjs/swagger';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { RegisterSeekerDto } from './dto/register-seeker.dto';
import { Seeker } from '../seekers/entities/seeker.entity';
import { Employer } from '../employers/entities/employer.entity';

export function loginDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Login page' }),
        ApiResponse({ status: 200, description: 'Successfully authenticated, returns JWT token.' }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' })
    );
}

export function registerSeekersDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Register a new seeker' }),
        ApiParam({
            name: 'registerSeekerDto',
            type: RegisterSeekerDto,
            description: 'Seeker information',
        }),
        ApiResponse({
            status: 201,
            description: 'Seeker registered successfully.',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Compte Chercheur créé avec succès.',
                    },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            username: { type: 'string', example: 'johndoe' },
                            email: { type: 'string', example: 'john@example.com' },
                        },
                    },
                    seeker: {
                        $ref: getSchemaPath(Seeker), // References your actual Seeker entity schema
                    },
                },
            },
        }),
        ApiResponse({ status: 400, description: 'Validation failed or email already exists.' }),
    );
}

export function registerEmployerDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Register a new employer' }),
        ApiParam({
            name: 'registerEmployerDto',
            type: RegisterEmployerDto,
            description: 'Employer information',
        }),
        ApiResponse({
            status: 201,
            description: 'Employer registered successfully.',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Compte Employeur créé avec succès.',
                    },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            username: { type: 'string', example: 'johndoe' },
                            email: { type: 'string', example: 'john@example.com' },
                        },
                    },
                    seeker: {
                        $ref: getSchemaPath(Employer), // References your actual Seeker entity schema
                    },
                },
            },
        }),
        ApiResponse({ status: 400, description: 'Validation failed or email already exists.' }),
    );
}
