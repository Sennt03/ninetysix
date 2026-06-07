import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { CreateUserDto } from './create-user.dto';

/**
 * Permite actualizar email/username y los roles (solo ADMIN desde el panel).
 * La contraseña se gestiona aparte (flujo de cambio de contraseña).
 */
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @ApiPropertyOptional({ enum: Role, isArray: true, example: [Role.USER] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
