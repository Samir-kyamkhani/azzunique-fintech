import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  platformServiceFeatureTable,
  platformServiceProviderTable,
  serviceProviderFeatureTable,
  serviceProviderTable,
} from '../models/core/index.js';

class PlatformServiceProviderService {
  assertAdmin(actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only admin allowed');
    }
  }

  async assign(data, actor) {
    this.assertAdmin(actor);

    await db
      .insert(platformServiceProviderTable)
      .values({
        platformServiceId: data.platformServiceId,
        serviceProviderId: data.serviceProviderId,
        config: data.config,
        isActive: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          config: data.config,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async listByService(serviceId) {
    const rows = await db
      .select({
        providerId: serviceProviderTable.id,
        code: serviceProviderTable.code,
        providerName: serviceProviderTable.providerName,
        handler: serviceProviderTable.handler,
        config: platformServiceProviderTable.config,

        featureId: platformServiceFeatureTable.id,
        featureName: platformServiceFeatureTable.name,
      })
      .from(platformServiceProviderTable)
      .innerJoin(
        serviceProviderTable,
        eq(
          platformServiceProviderTable.serviceProviderId,
          serviceProviderTable.id,
        ),
      )
      .leftJoin(
        serviceProviderFeatureTable,
        eq(
          serviceProviderFeatureTable.serviceProviderId,
          serviceProviderTable.id,
        ),
      )
      .leftJoin(
        platformServiceFeatureTable,
        eq(
          platformServiceFeatureTable.id,
          serviceProviderFeatureTable.platformServiceFeatureId,
        ),
      )
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, serviceId),
          eq(platformServiceProviderTable.isActive, true),
        ),
      );

    // 🔥 Grouping logic
    const grouped = {};

    for (const row of rows) {
      if (!grouped[row.providerId]) {
        grouped[row.providerId] = {
          id: row.providerId,
          code: row.code,
          providerName: row.providerName,
          handler: row.handler,
          config: row.config,
          features: [],
        };
      }

      if (row.featureId) {
        const alreadyExists = grouped[row.providerId].features.some(
          (f) => f.id === row.featureId,
        );

        if (!alreadyExists) {
          grouped[row.providerId].features.push({
            id: row.featureId,
            name: row.featureName,
          });
        }
      }
    }

    return Object.values(grouped);
  } /// Other methods like disable and updateConfig would go here

  async disable(serviceId, providerId, actor) {
    this.assertAdmin(actor);

    await db
      .update(platformServiceProviderTable)
      .set({ isActive: false })
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, serviceId),
          eq(platformServiceProviderTable.serviceProviderId, providerId),
        ),
      );

    return { success: true };
  }

  async updateConfig(serviceId, providerId, config, actor) {
    this.assertAdmin(actor);

    await db
      .update(platformServiceProviderTable)
      .set({
        config,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, serviceId),
          eq(platformServiceProviderTable.serviceProviderId, providerId),
        ),
      );

    return { success: true };
  }
}

export default new PlatformServiceProviderService();
