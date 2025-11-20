import { UserEntity } from './entities/user.entity';
import { UserDTO } from './dto/user.dto';

/**
 * Converte uma entidade de usuário (`UserEntity`) em um objeto de transferência (`UserDTO`).
 * Normaliza/mascara o CPF para o formato 000.000.000-00 antes de retornar.
 */
export function toUserDTO(entity: UserEntity): UserDTO {
  const dto = new UserDTO();
  dto.id = entity.id;
  dto.uid = entity.uid;
  dto.name = entity.name;
  dto.email = entity.email;

  const cpf = entity.cpf.replace(/\D/g, '');
  dto.cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return dto;
}
