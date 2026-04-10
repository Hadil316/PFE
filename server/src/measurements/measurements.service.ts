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
      V1N: acc.V1N + (Number(curr.V1N) || 0), V2N: acc.V2N + (Number(curr.V2N) || 0), V3N: acc.V3N + (Number(curr.V3N) || 0),
      V12: acc.V12 + (Number(curr.V12) || 0), V23: acc.V23 + (Number(curr.V23) || 0), V31: acc.V31 + (Number(curr.V31) || 0),
      I1: acc.I1 + (Number(curr.I1) || 0), I2: acc.I2 + (Number(curr.I2) || 0), I3: acc.I3 + (Number(curr.I3) || 0),
      HZ: acc.HZ + (Number(curr.HZ) || 0), PF: acc.PF + (Number(curr.PF) || 0),
      TKW: acc.TKW + (Number(curr.TKW) || 0), IKWH: acc.IKWH + (Number(curr.IKWH) || 0),
      count: acc.count + 1
    }), { V1N:0, V2N:0, V3N:0, V12:0, V23:0, V31:0, I1:0, I2:0, I3:0, HZ:0, PF:0, TKW:0, IKWH:0, count:0 });

    return {
      V1N: (agg.V1N / agg.count).toFixed(1), V2N: (agg.V2N / agg.count).toFixed(1), V3N: (agg.V3N / agg.count).toFixed(1),
      V12: (agg.V12 / agg.count).toFixed(1), V23: (agg.V23 / agg.count).toFixed(1), V31: (agg.V31 / agg.count).toFixed(1),
      I1: (agg.I1 / agg.count).toFixed(2), I2: (agg.I2 / agg.count).toFixed(2), I3: (agg.I3 / agg.count).toFixed(2),
      HZ: (agg.HZ / agg.count).toFixed(2), PF: (agg.PF / agg.count).toFixed(2),
      TKW: agg.TKW.toFixed(2), IKWH: agg.IKWH.toFixed(2),
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
      if (!targetIds || targetIds.length === 0) return [];

      const startDate = new Date();
      let sqlTime: any;
      let groupByInterval: string;

      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        sqlTime = sql`date_trunc('day', ${schema.measurements.timestamp})`;
        groupByInterval = 'day';
      } else if (period === 'month') {
        startDate.setDate(startDate.getDate() - 30);
        sqlTime = sql`date_trunc('day', ${schema.measurements.timestamp})`;
        groupByInterval = 'day';
      } else {
        // Jour: groupe par heure
        startDate.setHours(startDate.getHours() - 24);
        sqlTime = sql`date_trunc('hour', ${schema.measurements.timestamp})`;
        groupByInterval = 'hour';
      }

      const results = await this.db.select({
          time: sqlTime.as('time'),
          avgPower: sql`cast(avg(${schema.measurements.TKW}) as float)`.as('avgPower'),
          avgVoltage: sql`cast(avg((${schema.measurements.V1N} + ${schema.measurements.V2N} + ${schema.measurements.V3N}) / 3) as float)`.as('avgVoltage'),
          avgCurrent: sql`cast(avg((${schema.measurements.I1} + ${schema.measurements.I2} + ${schema.measurements.I3}) / 3) as float)`.as('avgCurrent'),
        })
        .from(schema.measurements)
        .where(and(inArray(schema.measurements.assetId, targetIds), gte(schema.measurements.timestamp, startDate)))
        .groupBy(sqlTime)
        .orderBy(sqlTime);

      // Filtrer les valeurs nulles et formater
      return results.filter(r => r.avgPower !== null && r.avgVoltage !== null && r.avgCurrent !== null);
    } catch (error) {
      console.error('Error in findHistory:', error);
      return [];
    }
  }
}