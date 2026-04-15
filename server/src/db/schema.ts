import { pgTable, serial, text, integer, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";

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
  webSocketLink: varchar("websocketlink", { length: 255 }),
  maxCurrent: doublePrecision("max_current").default(80.0),
});

export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  V1N: doublePrecision("v1n"), V2N: doublePrecision("v2n"), V3N: doublePrecision("v3n"),
  V12: doublePrecision("v12"), V23: doublePrecision("v23"), V31: doublePrecision("v31"),
  I1: doublePrecision("i1"), I2: doublePrecision("i2"), I3: doublePrecision("i3"),
  TKW: doublePrecision("tkw"), IKWH: doublePrecision("ikwh"), HZ: doublePrecision("hz"), 
  PF: doublePrecision("pf"), KVAH: doublePrecision("kvah"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  message: text("message").notNull(),
  value: doublePrecision("value").notNull(),
  threshold: doublePrecision("threshold").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// NOUVELLE TABLE POUR LE SPRINT FINAL
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  month: text("month").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});