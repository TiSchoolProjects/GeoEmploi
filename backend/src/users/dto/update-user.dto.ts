import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ description: 'New user status', enum: UserStatus, example: UserStatus.SUSPENDED })
  @IsEnum(UserStatus)
  status: UserStatus;
}
