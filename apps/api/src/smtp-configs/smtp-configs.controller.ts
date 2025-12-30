import { Controller } from '@nestjs/common';
import { SmtpConfigsService } from './smtp-configs.service';

@Controller('smtp-configs')
export class SmtpConfigsController {
  constructor(private readonly smtpConfigsService: SmtpConfigsService) {}
}
