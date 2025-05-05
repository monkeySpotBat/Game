import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game scores table schema
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  score: integer("score").notNull(),
  levelsCompleted: integer("levels_completed").notNull(),
  playedWith: text("played_with").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  userId: true,
  score: true,
  levelsCompleted: true,
  playedWith: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type User = typeof users.$inferSelect;
export type Score = typeof scores.$inferSelect;
