import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ThresholdsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    return await this.db.select().from(schema.thresholds);
  }

  async findByAsset(assetId: number) {
    return await this.db.select().from(schema.thresholds).where(eq(schema.thresholds.assetId, assetId));
  }

  async findOne(id: number) {
    const res = await this.db.select().from(schema.thresholds).where(eq(schema.thresholds.id, id));
    return res[0] || null;
  }

  async create(data: any) {
    return await this.db.insert(schema.thresholds).values({
      assetId: data.assetId,
      parameter: data.parameter,
      minValue: data.minValue || null,
      maxValue: data.maxValue || null,
      isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    }).returning();
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.minValue !== undefined) updateData.minValue = data.minValue;
    if (data.maxValue !== undefined) updateData.maxValue = data.maxValue;
    if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0;
    updateData.updatedAt = new Date();

    return await this.db.update(schema.thresholds).set(updateData).where(eq(schema.thresholds.id, id)).returning();
  }

  async remove(id: number) {
    return await this.db.delete(schema.thresholds).where(eq(schema.thresholds.id, id)).returning();
  }

  async toggleActive(id: number) {
    const threshold = await this.findOne(id);
    if (!threshold) return null;
    
    return await this.db.update(schema.thresholds)
      .set({ isActive: threshold.isActive ? 0 : 1, updatedAt: new Date() })
      .where(eq(schema.thresholds.id, id))
      .returning();
  }
}
