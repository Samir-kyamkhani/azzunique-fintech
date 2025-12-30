import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateSmtpConfigDto {
  @IsString()
  @IsNotEmpty()
  smtpHost!: string;

  @IsString()
  @IsNotEmpty()
  smtpPort!: string;

  @IsString()
  @IsNotEmpty()
  smtpUsername!: string;

  @IsString()
  @IsNotEmpty()
  smtpPassword!: string;

  @IsIn(['TLS', 'SSL', 'STARTTLS'])
  encryptionType!: 'TLS' | 'SSL' | 'STARTTLS';

  @IsString()
  @IsNotEmpty()
  fromName!: string;

  @IsEmail()
  @IsNotEmpty()
  fromEmail!: string;
}
