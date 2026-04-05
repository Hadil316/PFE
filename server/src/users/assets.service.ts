import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AssetsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  // 1. جلب الشجرة (The Tree Logic) - FIX 500
  async findAll() {
    try {
      // نجيبوا العناصر الكل مالقاعدة
      const allAssets = await this.db.select().from(schema.assets);
      
      // دالة بناء الشجرة (Recursive Function)
      const buildTree = (pId: number | null) => {
        return allAssets
          .filter((asset: any) => {
            // تثبت دقيق: هل الـ parentId هو null أو مطابق؟
            if (pId === null) return asset.parentId === null || asset.parentId === undefined;
            return asset.parentId === pId;
          })
          .map((asset: any) => ({
            ...asset,
            children: buildTree(asset.id) // يجيب العناصر اللي تحتو (TGBT)
          }));
      };

      return buildTree(null); // نبدوا دايما بالـ Sites اللي الـ parent متاعهم null
    } catch (e) {
      console.error("Erreur Hierarchy Logic:", e);
      return []; // يرجع فارغ في عوض ما يعمل crash للسرفر
    }
  }

  // 2. جلب عنصر واحد للـ Dashboard
  async findOne(id: number) {
    if (!id || isNaN(id)) return null;
    const res = await this.db.select().from(schema.assets).where(eq(schema.assets.id, id));
    return res[0] || null;
  }

  async create(data: any) {
    const { id, ...cleanData } = data;
    return await this.db.insert(schema.assets).values(cleanData).returning();
  }

  async remove(id: number) {
    return await this.db.delete(schema.assets).where(eq(schema.assets.id, id));
  }
  
}