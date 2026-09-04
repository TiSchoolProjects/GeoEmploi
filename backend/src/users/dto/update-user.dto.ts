import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Email address', example: 'yourmail@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'User\'s firstname', example: 'John' })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiPropertyOptional({ description: 'User\'s lastname', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastname?: string;
}


export class UpdateStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
