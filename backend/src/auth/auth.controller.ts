import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserCreateDTO } from 'src/users/dto/user-create.dto';
import { JwtPayload } from './dto/jwt-payload.interface';
import { LoginUserDTO } from './dto/login-user.dto';
import { LoginStatus } from './dto/login-status.interface';
import { RegistrationStatus } from './dto/registration-status.interface';

@Controller('auth')

/**
 * Controller responsável pelos endpoints de autenticação.
 *
 * Define rotas:
 * - POST /auth/register
 * - POST /auth/login
 * - GET /auth/whoami (rota protegida)
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * Recebe dados de criação de usuário e chama AuthService.register.
   * Caso o status retornado indique falha, lança HttpException 400.
   * Caso contrário, retorna o RegistrationStatus ao cliente.
   */
  @Post('register')
  public async register(@Body() createUserDto: UserCreateDTO): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(createUserDto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  /**
   * POST /auth/login
   *
   * Recebe credenciais de login, delega para AuthService.login
   * e retorna LoginStatus com token e dados básicos do usuário.
   */
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDTO): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }

  /**
   * GET /auth/whoami
   *
   * Rota protegida por JwtAuthGuard. Retorna o payload decodeado do token,
   * que foi anexado em req.user pelo guard/strategy JWT.
   */
  @Get('whoami')
  @UseGuards(JwtAuthGuard)
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
