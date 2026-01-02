import { eq } from "drizzle-orm";
import { usersTable } from "../models/core";
import { db } from '../database/core/core-db.js';

export const attachUserHierarchy = async (req, res, next) => {
  try {
    if (req.user.type !== 'USER') return next();

    const [user] = await db
      .select({ parentId: usersTable.parentId })
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);

    req.user.parentId = user?.parentId ?? null;

    next();
  } catch (err) {
    next(err);
  }
};
