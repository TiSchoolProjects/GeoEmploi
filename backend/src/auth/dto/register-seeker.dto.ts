import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterSeekerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsNotEmpty()
  skills: string[];

  @IsString()
  @IsNotEmpty()
  experience: string;

  @IsString()
  @IsNotEmpty()
  availability: string;
}
