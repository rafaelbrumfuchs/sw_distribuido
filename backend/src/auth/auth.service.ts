import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { DEFAULT_EXPIRESIN } from './auth.module';
import { JwtPayload } from './dto/jwt-payload.interface';
import { LoginStatus } from './dto/login-status.interface';
import { RegistrationStatus } from './dto/registration-status.interface';
import { LoginUserDTO } from './dto/login-user.dto';
import { UserCreateDTO } from 'src/users/dto/user-create.dto';
import { UserDTO } from 'src/users/dto/user.dto';

@Injectable()
/**
 * Serviço de autenticação.
 *
 * Responsável por:
 * - Registrar novos usuários (delegando ao UsersService)
 * - Autenticar usuários (login)
 * - Gerar e assinar tokens JWT
 * - Validar usuários a partir do payload do token
 */
export class AuthService {
  /**
   * Injeta UsersService (para operações com usuários)
   * e JwtService (para criação/validação de tokens).
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário no sistema.
   * Retorna um objeto RegistrationStatus indicando sucesso ou falha.
   *
   * Em caso de erro na criação do usuário, captura a exceção
   * e ajusta o status com a mensagem correspondente.
   */
  async register(userDto: UserCreateDTO): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };
    try {
      await this.usersService.createUser(userDto);
    } catch (err) {
      status = {
        success: false,
        message: err.message || 'user registration failed',
      };
    }
    return status;
  }

  /**
   * Realiza o login do usuário:
   * - Busca usuário por email/senha (UsersService.findByLogin)
   * - Gera token JWT (_createToken)
   * - Retorna LoginStatus com token, expiração e uid.
   */
  async login(loginUserDto: LoginUserDTO): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(loginUserDto);

    const token = this._createToken(user);

    return {
      accessToken: token.accessToken,
      expiresIn: token.expiresIn,
      uid: user.uid,
    };
  }

  /**
   * Cria o token JWT a partir do uid do usuário.
   * Define o payload (JwtPayload) e assina com JwtService.
   *
   * O tempo de expiração é lido de process.env.EXPIRESIN
   * ou usa DEFAULT_EXPIRESIN caso não esteja definido.
   */
  private _createToken({ uid }: UserDTO): any {
    const user: JwtPayload = { uid };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn: process.env.EXPIRESIN ? process.env.EXPIRESIN : DEFAULT_EXPIRESIN,
      accessToken,
    };
  }

  /**
   * Valida um usuário a partir do payload do token JWT.
   * Utiliza UsersService.findByPayload para recuperar o usuário.
   *
   * Lança HttpException UNAUTHORIZED se o usuário não for encontrado,
   * indicando token inválido.
   */
  async validateUser(payload: JwtPayload): Promise<UserDTO> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
