import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import { desc, eq, sql, and, gte, inArray } from 'drizzle-orm';

@Injectable()
export class MeasurementsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async create(data: any) {
    const finalData = {
      ...data,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    };
    return await this.db.insert(schema.measurements).values(finalData).returning();
  }

  async findLatest(assetId: number) {
    const allAssets = await this.db.select().from(schema.assets);
    const getAllDescendantIds = (id: number): number[] => {
      const children = allAssets.filter(a => a.parentId === id);
      let ids = [id];
      for (const child of children) { ids = [...ids, ...getAllDescendantIds(child.id)]; }
      return ids;
    };

    const targetIds = getAllDescendantIds(assetId);
    if (targetIds.length === 0) return null;

    const latestRecords = await Promise.all(
      targetIds.map(async (id) => {
        const res = await this.db.select().from(schema.measurements)
          .where(eq(schema.measurements.assetId, id))
          .orderBy(desc(schema.measurements.timestamp)).limit(1);
        return res[0];
      })
    );

    const validData = latestRecords.filter(r => r != null);
    if (validData.length === 0) return null;

    const agg = validData.reduce((acc, curr) => ({
      V1N: acc.V1N + (Number(curr.V1N) || 0),
      TKW: acc.TKW + (Number(curr.TKW) || 0),
      count: acc.count + 1
    }), { V1N: 0, TKW: 0, count: 0 });

    return {
      V1N: (agg.V1N / agg.count).toFixed(1),
      TKW: agg.TKW.toFixed(2),
      timestamp: validData[0].timestamp
    };
  }

  async findHistory(assetId: number, period: string) {
    try {
      const allAssets = await this.db.select().from(schema.assets);
      const getAllDescendantIds = (id: number): number[] => {
        const children = allAssets.filter(a => a.parentId === id);
        let ids = [id];
        for (const child of children) { ids = [...ids, ...getAllDescendantIds(child.id)]; }
        return ids;
      };

      const targetIds = getAllDescendantIds(assetId);
      
      // SECURITÉ 1 : Si aucun ID trouvé, on renvoie un tableau vide au lieu de faire planter SQL
      if (!targetIds || targetIds.length === 0) return [];

      const startDate = new Date();
      let interval = 'hour'; // Par défaut pour 'day'

      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        interval = 'day';
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
        interval = 'day';
      } else {
        startDate.setDate(startDate.getDate() - 1);
      }

      // SECURITÉ 2 : Requête avec Cast explicite pour éviter les erreurs de type 500
      const result = await this.db
        .select({
          time: sql`date_trunc(${interval}, ${schema.measurements.timestamp})`.as('time'),
          avgPower: sql`cast(avg(${schema.measurements.TKW}) as float)`.as('avgPower'),
        })
        .from(schema.measurements)
        .where(
          and(
            inArray(schema.measurements.assetId, targetIds),
            gte(schema.measurements.timestamp, startDate)
          )
        )
        .groupBy(sql`1`) // Groupement par la 1ère colonne (time)
        .orderBy(sql`1`);

      return result;
    } catch (error) {
      // Pour voir l'erreur réelle dans ton terminal NestJS
      console.error("ERREUR SQL SPRINT 2:", error);
      return [];
    }
  }
}