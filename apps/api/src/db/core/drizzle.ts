import { Injectable } from '@nestjs/common';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';

import { corePool } from './mysql';
import * as schema from './schema';

@Injectable()
export class CoreDbService {
  private readonly drizzleDb: MySql2Database<typeof schema>;

  // Drizzle method proxies
  public readonly select: MySql2Database<typeof schema>['select'];
  public readonly insert: MySql2Database<typeof schema>['insert'];
  public readonly update: MySql2Database<typeof schema>['update'];
  public readonly delete: MySql2Database<typeof schema>['delete'];
  public readonly transaction: MySql2Database<typeof schema>['transaction'];

  constructor() {
    this.drizzleDb = drizzle(corePool, {
      schema,
      mode: 'default',
    });

    // bind AFTER initialization (this is the key)
    this.select = this.drizzleDb.select.bind(this.drizzleDb);
    this.insert = this.drizzleDb.insert.bind(this.drizzleDb);
    this.update = this.drizzleDb.update.bind(this.drizzleDb);
    this.delete = this.drizzleDb.delete.bind(this.drizzleDb);
    this.transaction = this.drizzleDb.transaction.bind(this.drizzleDb);
  }
}
