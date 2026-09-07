import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'yourmail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Account password', example: 'very-secret-password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}