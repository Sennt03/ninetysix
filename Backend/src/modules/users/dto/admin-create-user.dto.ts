import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { CreateUserDto } from './create-user.dto';

/**
 * Alta de usuario hecha por un ADMIN desde el panel: además de email/username/
 * password, puede asignar los roles. Si no se envían, el usuario nace como USER.
 */
export class AdminCreateUserDto extends CreateUserDto {
  @ApiPropertyOptional({ enum: Role, isArray: true, example: [Role.USER] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
