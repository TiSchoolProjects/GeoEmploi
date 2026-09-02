import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Email address', example: 'yourmail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Account password', example: 'very-secret-password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User\'s first and last name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  username: string;
}

