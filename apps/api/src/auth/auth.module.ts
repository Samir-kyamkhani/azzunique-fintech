import { Module } from '@nestjs/common';
import { AuditlogModule } from 'src/auditlog/auditlog.module';
import { AuthInfraModule } from './auth-infra.module';
import { EmailsModule } from 'src/emails/emails.module';
import { DbModule } from 'src/db/db.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtilsService } from 'src/lib/utils/auth-utils';
import { IdentityProvider } from './strategies/identity.provider';
import { UserAuthResolver } from './resolvers/user.resolver';

@Module({
  imports: [AuthInfraModule, AuditlogModule, EmailsModule, DbModule],

  providers: [
    AuthService,
    IdentityProvider,
    AuthUtilsService,
    UserAuthResolver,
  ],

  controllers: [AuthController],

  exports: [AuthUtilsService],
})
export class AuthModule {}
