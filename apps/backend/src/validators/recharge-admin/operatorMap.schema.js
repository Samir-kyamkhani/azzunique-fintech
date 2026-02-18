import { z } from 'zod';

export const upsertOperatorMapSchema = z.object({
  platformServiceId: z.string().uuid(),
  serviceProviderId: z.string().uuid(),
  internalOperatorCode: z.string().min(1),
  providerOperatorCode: z.string().min(1),
});

// | Field                | Meaning                             |
// | -------------------- | ----------------------------------- |
// | internalOperatorCode | Tumhara system ka operator code     |
// | platformServiceId    | Kaunsa service (Mobile, DTH, etc.)  |
// | serviceProviderId         | Kaunsa provider (MPLAN, RX etc.)    |
// | providerOperatorCode | Provider ko bhejne wala actual code |
