import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `projecty_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const clothingItems = createTable("clothing_item", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  description: d.varchar({ length: 4096 }).notNull(),
  classification: d.varchar({ length: 255 }).notNull(),
  image: d.varchar({ length: 255 }).notNull(),
  userId: d.varchar({ length: 255 }).notNull().references(() => users.id),
  tagsVector: d.vector({ dimensions: 1536 }).notNull(),
  status: d.varchar({ length: 255 }).notNull().default("available"),
}));

export const clothingItemsRelations = relations(clothingItems, ({ one }) => ({
  user: one(users, { fields: [clothingItems.userId], references: [users.id] }),
}));

export const outfits = createTable("outfit", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  prompt: d.varchar({ length: 4096 }).notNull(),
  description: d.varchar({ length: 4096 }).notNull(),
  topId: d.varchar({ length: 255 }).references(() => clothingItems.id),
  bottomId: d.varchar({ length: 255 }).references(() => clothingItems.id),
  miscIds: d.varchar({ length: 255 }).array(),
  shoesId: d.varchar({ length: 255 }).references(() => clothingItems.id),
  userId: d.varchar({ length: 255 }).notNull().references(() => users.id),
  score: d.numeric(),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(users, { fields: [outfits.userId], references: [users.id] }),
  top: one(clothingItems, { fields: [outfits.topId], references: [clothingItems.id] }),
  bottom: one(clothingItems, { fields: [outfits.bottomId], references: [clothingItems.id] }),
  shoes: one(clothingItems, { fields: [outfits.shoesId], references: [clothingItems.id] }),
  misc: many(clothingItems, { relationName: "clothing_item_outfit" }),
}));

export const clothingItemsOutfits = createTable("clothing_item_outfit", (d) => ({
  clothingItemId: d.varchar({ length: 255 }).notNull().references(() => clothingItems.id),
  outfitId: d.varchar({ length: 255 }).notNull().references(() => outfits.id),
}), (t) => [primaryKey({ columns: [t.clothingItemId, t.outfitId] })]);

export const clothingItemsOutfitsRelations = relations(clothingItemsOutfits, ({ one }) => ({
  clothingItem: one(clothingItems, { fields: [clothingItemsOutfits.clothingItemId], references: [clothingItems.id] }),
  outfit: one(outfits, { fields: [clothingItemsOutfits.outfitId], references: [outfits.id] }),
}));

export const outfitFeedback = createTable("outfit_feedback", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  outfitId: d.varchar({ length: 255 }).notNull().references(() => outfits.id),
  userId: d.varchar({ length: 255 }).notNull().references(() => users.id),
  rating: d.integer().notNull(),
  comment: d.varchar({ length: 4096 }),
  createdAt: d.timestamp().notNull().$defaultFn(() => new Date()),
}));

export const outfitFeedbackRelations = relations(outfitFeedback, ({ one }) => ({
  outfit: one(outfits, { fields: [outfitFeedback.outfitId], references: [outfits.id] }),
  user: one(users, { fields: [outfitFeedback.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type ClothingItem = typeof clothingItems.$inferSelect;
export type Outfit = typeof outfits.$inferSelect;