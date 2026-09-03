import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterEmployerDto {
  @ApiProperty({ description: 'Email address', example: 'yourmail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User\'s firstname', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ description: 'User\'s lastname', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ description: 'Account password', example: 'very-secret-password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Name of the company', example: 'PlaceHolder ltd inc.' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: 'Description of the company', example: 'Provider of informatic services' })
  @IsString()
  @IsNotEmpty()
  companyDesc: string;
}
