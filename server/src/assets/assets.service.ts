import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AssetsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    try {
      const allAssets = await this.db.select().from(schema.assets);
      console.log("Assets mel Base:", allAssets);

      if (!allAssets || allAssets.length === 0) {
        console.log("Aucune donnée dans la table assets");
        return [];
      }

      const buildTree = (pId: number | null) => {
        return allAssets
          .filter((a: any) => a.parentId === pId)
          .map((a: any) => ({
            ...a,
            children: buildTree(a.id)
          }));
      };

      const result = buildTree(null);
      console.log("Tree 7adhir:", result);
      return result;
    } catch (e: any) {
      console.error("Erreur Backend Assets:", e.message || e);
      console.error("Stack:", e.stack);
      return [];
    }
  }

  async findOne(id: number) {
    const res = await this.db.select().from(schema.assets).where(eq(schema.assets.id, id));
    return res[0] || null;
  }

  async create(data: any) {
    const { id, ...cleanData } = data;
    return await this.db.insert(schema.assets).values(cleanData).returning();
  }

  async update(id: number, data: any) {
    const { id: _, children, ...updateData } = data;
    return await this.db.update(schema.assets)
      .set(updateData)
      .where(eq(schema.assets.id, id))
      .returning();
  }
  
  async remove(id: number) {
    return await this.db.delete(schema.assets).where(eq(schema.assets.id, id));
  }
}
