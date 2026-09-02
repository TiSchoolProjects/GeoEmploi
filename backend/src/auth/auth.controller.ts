import { Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { User } from "../users/entities/user.entity";
import { RegisterSeekerDto } from "./dto/register-seeker.dto";
import { RegisterEmployerDto } from "./dto/register-employer.dto";
import { loginDoc, registerSeekersDoc, registerEmployerDoc } from "./auth.controller.docs";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @loginDoc()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request & { user: User}) {
    return this.authService.login(req.user);
  }

  @registerSeekersDoc()
  @Post('register/seeker')
  registerSeeker(@Body() registerSeekerDto: RegisterSeekerDto) {
    return this.authService.registerSeeker(registerSeekerDto,);
  }

  @registerEmployerDoc()
  @Post('register/employer')
  registerEmployer(@Body() registerEmployerDto: RegisterEmployerDto) {
    return this.authService.registerEmployer(registerEmployerDto,);
  }
}
