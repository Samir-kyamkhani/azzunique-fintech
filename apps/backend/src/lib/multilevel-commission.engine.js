import { db } from '../database/core/core-db.js';
import { usersTable } from '../models/core/index.js';
import { eq, and, isNull } from 'drizzle-orm';
import CommissionEngine from './commission.engine.js';

class MultiLevelCommission {
  static async process({ transaction, user, maxDepth = 6 }) {
    let current = user;
    let depth = 1;

    while (current.ownerUserId && depth <= maxDepth) {
      // 🛑 Self-cycle protection
      if (current.ownerUserId === current.id) break;

      const [parent] = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, current.ownerUserId),
            isNull(usersTable.deletedAt), // ❌ deleted users skip
            eq(usersTable.userStatus, 'ACTIVE'), // ❌ inactive users skip
          ),
        )
        .limit(1);

      if (!parent) break;

      // 💰 Credit commission (rule-based, safe)
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
