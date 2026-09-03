import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
