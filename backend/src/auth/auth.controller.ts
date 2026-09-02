import { Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { User } from "../users/entities/user.entity";
import { RegisterSeekerDto } from "./dto/register-seeker.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request & { user: User}) {
    return this.authService.login(req.user);
  }

  @Post('register/seeker')
  registerSeeker(@Body() registerSeekerDto: RegisterSeekerDto) {
    return this.authService.registerSeeker(registerSeekerDto,);
  }
}
