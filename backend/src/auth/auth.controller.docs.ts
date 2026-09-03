import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, getSchemaPath } from '@nestjs/swagger';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { RegisterSeekerDto } from './dto/register-seeker.dto';

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
        ApiResponse({ status: 201, description: 'Seeker registered successfully.', type: String}),
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
        ApiResponse({ status: 201, description: 'Employer registered successfully.', type: String}),
        ApiResponse({ status: 400, description: 'Validation failed or email already exists.' }),
    );
}
