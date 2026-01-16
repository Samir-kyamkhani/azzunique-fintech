import { db } from '../database/core/core-db.js';
import { usersTable } from '../models/core/index.js';
import { eq } from 'drizzle-orm';
import CommissionEngine from './commission.engine.js';

class MultiLevelCommission {
  static async process({ transaction, user, maxDepth = 3 }) {
    let current = user;
    let depth = 1;

    while (current.ownerUserId && depth <= maxDepth) {
      const [parent] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, current.ownerUserId))
        .limit(1);

      if (!parent) break;

      await CommissionEngine.calculateAndCredit({
        user: parent,
        transaction,
      });

      current = parent;
      depth++;
    }
  }
}

export default MultiLevelCommission;
