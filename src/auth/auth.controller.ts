import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() authCredentilasDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentilasDto);
  }

  @Post('/signin')
  async signIn(
    @Body() authCredentilasDto: AuthCredentialsDto,
  ): Promise<{ accesToken: string }> {
    return this.authService.signIn(authCredentilasDto);
  }
}
