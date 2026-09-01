import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const FILE_DIRECTION_OUTBOUND = "outbound" as const;
export const FILE_DIRECTION_INBOUND = "inbound" as const;
export type FileDirection =
  | typeof FILE_DIRECTION_OUTBOUND
  | typeof FILE_DIRECTION_INBOUND;

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  pathname: text("pathname").notNull(),
  filename: varchar("filename", { length: 500 }).notNull(),
  size: integer("size").notNull(),
  mimeType: varchar("mime_type", { length: 255 }),
  /** outbound = admin→client (has expiry); inbound = client→admin (no expiry) */
  direction: varchar("direction", { length: 20 })
    .notNull()
    .default(FILE_DIRECTION_OUTBOUND),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  isZip: boolean("is_zip").default(false).notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;
