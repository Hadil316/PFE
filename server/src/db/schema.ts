import { pgTable, serial, text, integer, timestamp, doublePrecision, pgEnum, varchar } from "drizzle-orm/pg-core";

// Enums kima 9bal
export const roleEnum = pgEnum("role", ["RESPONSABLE_ENERGIE", "UTILISATEUR", "ADMIN"]);
export const assetTypeEnum = pgEnum("asset_type", ["SITE", "TGBT", "ARMOIRE", "LIGNE", "EQUIPEMENT"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("UTILISATEUR"),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), 
  parentId: integer("parent_id"), 
  webSocketLink: varchar("websocketlink", { length: 255 }), // <-- AJOUT DU LIEN WEBSOCKET
});

// --- EL MODIFICATION HOUNI: Les nouvelles métriques du prof ---
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  
  // Tensions Simples (en MINUSCULES entre les guillemets)
  V1N: doublePrecision("v1n"), 
  V2N: doublePrecision("v2n"), 
  V3N: doublePrecision("v3n"),
  
  // Tensions Composées
  V12: doublePrecision("v12"), 
  V23: doublePrecision("v23"), 
  V31: doublePrecision("v31"),
  
  // Courants
  I1: doublePrecision("i1"), 
  I2: doublePrecision("i2"), 
  I3: doublePrecision("i3"),
  
  // Puissance, Énergies et Autres Métriques
  TKW: doublePrecision("tkw"),   
  IKWH: doublePrecision("ikwh"), 
  HZ: doublePrecision("hz"),     
  PF: doublePrecision("pf"),     
  KVAH: doublePrecision("kvah"), 
  
  timestamp: timestamp("timestamp").defaultNow(),
});