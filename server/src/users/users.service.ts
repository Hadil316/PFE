import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) 
    private db: NodePgDatabase<typeof schema>
  ) {}

  async findAll() {
    return await this.db.select().from(schema.users);
  }

  async create(data: any) {
    const { id, ...userData } = data; 
    
    // On insère le mot de passe DIRECTEMENT, sans hachage
    return await this.db.insert(schema.users).values({
      username: userData.username,
      email: userData.email,
      password: userData.password, 
      role: userData.role || 'UTILISATEUR'
    }).returning();
  }

  async update(id: number, data: any) {
    const { id: _, ...updateData } = data;
    return await this.db.update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id))
      .returning();
  }

  async remove(id: number) {
    return await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
  }

  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  }

  // Comparaison directe (string === string)
  async validatePassword(plain: string, stored: string): Promise<boolean> {
    return plain === stored;
  }
  async updatePassword(id: number, password: string) {
    return await this.db.update(schema.users)
      .set({ password })
      .where(eq(schema.users.id, id))
      .returning();
  }
}