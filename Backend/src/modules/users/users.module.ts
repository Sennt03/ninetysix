import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { isMongo } from '../../config/database-type';
import { UserMongooseRepository } from './repositories/user.mongoose.repository';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Provider que decide la implementación del repositorio según DATABASE_TYPE.
 * Los consumidores inyectan siempre `UserRepository` (la abstracción).
 */
const userRepositoryProvider: Provider = {
  provide: UserRepository,
  useClass: isMongo() ? UserMongooseRepository : UserPrismaRepository,
};

@Module({
  imports: isMongo() ? [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])] : [],
  controllers: [UsersController],
  providers: [UsersService, userRepositoryProvider],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
