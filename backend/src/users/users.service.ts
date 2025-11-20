import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDTO } from '../auth/dto/login-user.dto';
import { UserCreateDTO } from './dto/user-create.dto';
import { UserDTO } from './dto/user.dto';
import { UserListDTO } from './dto/user-list.dto';
import { UserEntity } from './entities/user.entity';
import { toUserDTO } from './mapper';
import * as uuid from 'uuid';
import { comparePasswords } from 'src/utils';

@Injectable()
/**
 * Serviço de usuários.
 *
 * Centraliza a lógica de negócio relacionada a usuários:
 * - Criação, atualização, deleção e listagem
 * - Autenticação/validação de credenciais
 * - Conversão de entidades em DTOs
 *
 * Utiliza o repositório TypeORM de `UserEntity` para acesso ao banco.
 */
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getOneUser(id: number): Promise<UserDTO> {
    return this.getUser(id);
  }

  async getUser(id: number): Promise<UserDTO> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return toUserDTO(user);
  }

  /**
   * Cria um novo usuário no sistema.
   * - Gera UID único
   * - Normaliza CPF
   * - Salva no banco
   * - Converte entidade salva em UserDTO
   *
   * @param dto Dados do usuário a ser criado.
   * @returns UserDTO do usuário recém-criado.
   */
  async createUser(userDTO: UserCreateDTO): Promise<UserDTO> {
    const userInDB = await this.usersRepository.findOne({ where: { email: userDTO.email } });
    if (userInDB) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const user = this.usersRepository.create({
      ...this.mapUserDTO(userDTO),
      uid: uuid.v4(),
    });

    const saved = await this.usersRepository.save(user);
    return toUserDTO(saved);
  }

  /**
   * Atualiza os dados de um usuário existente.
   * - Localiza o usuário pelo ID
   * - Atualiza os campos enviados
   * - Salva no banco
   *
   * CPF também é normalizado (somente números).
   *
   * @param id ID do usuário a ser atualizado.
   * @param dto Dados de atualização.
   * @returns UserDTO atualizado.
   */
  async updateUser(id: number, userDTO: UserCreateDTO): Promise<UserDTO> {
    const user = await this.usersRepository.preload({
      id,
      ...this.mapUserDTO(userDTO),
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const saved = await this.usersRepository.save(user);
    return toUserDTO(saved);
  }

  /**
   * Retorna a lista de todos os usuários cadastrados.
   * Converte cada entidade em UserDTO e empacota dentro de UserListDTO.
   *
   * @returns Lista de usuários no formato UserListDTO.
   */
  async getAllUsers(): Promise<UserListDTO> {
    const list: UserListDTO = new UserListDTO();
    const result: UserEntity[] = await this.usersRepository.find();

    for (const user of result) {
      list.users.push(toUserDTO(user));
    }

    return list;
  }

  async deleteUser(id: number) {
    try {
      await this.usersRepository.delete(id);
    } catch (exception) {
      throw new HttpException(exception, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Busca um usuário pelo e-mail informado no login.
   * Retorna o DTO se encontrado ou lança exceção caso não exista.
   *
   * @param loginUserDTO Objeto contendo email e senha.
   * @returns UserDTO do usuário encontrado.
   */
  async findByLogin({ email, password }: LoginUserDTO): Promise<UserDTO> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const areEqual = await comparePasswords(user.password, password);
    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return toUserDTO(user);
  }

  async findOne(options?: object): Promise<UserEntity> {
    return await this.usersRepository.findOne(options);
  }

  /**
   * Busca um usuário a partir do payload (geralmente extraído de um token JWT),
   * utilizando o campo `uid` como chave de pesquisa.
   *
   * @param payload Objeto contendo pelo menos a propriedade `uid`.
   * @returns Promessa que resolve para um `UserDTO` correspondente ao `uid`.
   */
  async findByPayload({ uid }: any): Promise<UserDTO> {
    return toUserDTO(await this.findOne({ where: { uid } }));
  }

  /**
   * Mapeia um `UserCreateDTO` para um objeto parcial de `UserEntity`,
   * adequado para operações de criação/atualização no banco.
   *
   * Também normaliza o CPF, removendo todos os caracteres não numéricos.
   *
   * @param dto DTO com os dados de criação de usuário.
   * @returns Objeto parcial de `UserEntity` contendo os campos principais.
   */
  private mapUserDTO(dto: UserCreateDTO): Partial<UserEntity> {
    return {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      cpf: dto.cpf.replace(/\D/g, ''),
    };
  }
}
