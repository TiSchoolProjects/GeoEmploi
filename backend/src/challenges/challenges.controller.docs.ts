import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Challenge } from './entities/challenge.entity';
import { ChallengeProgress } from './entities/challenge-progress.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

export function findAllAdminDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: 'Get all challenges' }),
    ApiResponse({
      status: 200,
      description: 'List of all challenges',
      type: [Challenge],
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}

export function createDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: 'Create a new challenge' }),
    ApiBody({ type: CreateChallengeDto }),
    ApiResponse({
      status: 201,
      description: 'Challenge created successfully',
      type: Challenge,
    }),
    ApiResponse({ status: 400, description: 'Invalid payload format' }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}

export function updateDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: 'Update an existing challenge' }),
    ApiParam({
      name: 'id',
      description: 'Unique challenge id',
      example: 1,
      type: Number,
    }),
    ApiBody({ type: UpdateChallengeDto }),
    ApiResponse({
      status: 200,
      description: 'Challenge updated successfully',
      type: Challenge,
    }),
    ApiResponse({ status: 400, description: 'Invalid ID or payload format' }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
    ApiResponse({ status: 404, description: 'Challenge not found' }),
  );
}

export function todayDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: "Get today's active challenge and progress" }),
    ApiResponse({
      status: 200,
      description: "Today's active challenge retrieved with current user progress",
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}

export function historyDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: "Get seeker's challenge progress history" }),
    ApiResponse({
      status: 200,
      description: 'Challenge progress history',
      type: [ChallengeProgress],
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}

export function recordJobViewDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: "Record a job view towards today's challenge" }),
    ApiParam({
      name: 'jobId',
      description: 'Unique job id',
      example: 105,
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: 'Job view logged and progress updated',
    }),
    ApiResponse({ status: 400, description: 'Invalid job ID' }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}

export function hideDoc() {
  return applyDecorators(
    ApiBearerAuth('JWT-Auth'),
    ApiOperation({ summary: 'Permanently hide daily challenges for seeker' }),
    ApiResponse({
      status: 200,
      description: 'Challenges permanently hidden for user',
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials', type: undefined }),
    ApiResponse({ status: 403, description: 'Missing permissions', type: undefined }),
  );
}