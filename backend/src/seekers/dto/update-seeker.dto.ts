import { PartialType } from '@nestjs/swagger';
import { CreateSeekerDto } from './create-seeker.dto';

export class UpdateSeekerDto extends PartialType(CreateSeekerDto) {}
