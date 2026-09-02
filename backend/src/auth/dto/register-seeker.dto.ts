import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterSeekerDto {
  @ApiProperty({ description: 'Email address', example: 'yourmail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User\'s first and last name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Account password', example: 'very-secret-password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Array of skills', example: ['Management', 'Python', 'Fullstack']})
  @IsArray()
  @IsNotEmpty()
  skills: string[];

  @ApiProperty({ description: 'Job experience', example: '2 years'})
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiProperty({ description: 'Time until user is available', example: 'Immediately'})
  @IsString()
  @IsNotEmpty()
  availability: string;
}
