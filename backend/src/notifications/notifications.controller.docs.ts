import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Notification } from './entities/notification.entity';

export function findMeDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get all notifications for current account' }),
        ApiResponse({ status: 200, description: 'Returns all notifications', type: [Notification] }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' })
    );
}

export function nbrUnreadDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Get the number of unread notifications' }),
        ApiResponse({ status: 201, description: 'Number of unread notifications.', type: Number }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' }),
        ApiResponse({ status: 403, description: 'Missing permissions.' }),
    );
}

export function markReadDoc() {
    return applyDecorators(
        ApiBearerAuth('JWT-Auth'),
        ApiOperation({ summary: 'Mark a notification as read' }),
        ApiParam({ name: 'id', description: 'Unique notification id' }),
        ApiResponse({ status: 200, description: 'Notification marked as read.', type: String }),
        ApiResponse({ status: 401, description: 'Invalid credentials.' }),
        ApiResponse({ status: 403, description: 'Missing permissions.' }),
        ApiResponse({ status: 404, description: 'No notification found.' }),
    );
}
