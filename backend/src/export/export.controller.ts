import { Controller, Get, Header, Req,  } from '@nestjs/common';
import { ExportService } from './export.service';
import { UserRole } from '../auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get('json')
    exportJson(@Req() req: Request & { user: { userId: number; role: UserRole; }; },) {
        return this.exportService.export(req.user.userId, req.user.role);
    }
}