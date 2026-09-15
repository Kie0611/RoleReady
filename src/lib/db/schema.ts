import {
  pgTable, pgEnum, uuid, varchar, text,
  integer, timestamp, jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id:            uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name"),
  email:         text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image:         text("image"),
  passwordHash:  text("password_hash"),
});

export const accounts = pgTable("account", {
  userId:            uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").$type<AdapterAccountType>().notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId:       uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
]);


export const interviewTypeEnum = pgEnum("interview_type", [
  "behavioral", "technical", "mixed",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "in_progress", "completed", "abandoned",
]);

export const difficultyEnum = pgEnum("difficulty_level", [
  "junior", "mid", "senior",
]);

export const interviewSessions = pgTable("interview_sessions", {
  id:              uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:          uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role:            varchar("role", { length: 255 }).notNull(),
  company:         varchar("company", { length: 255 }),
  jobDescription:  text("job_description"),
  interviewType:   interviewTypeEnum("interview_type").notNull().default("mixed"),
  difficulty:      difficultyEnum("difficulty").notNull().default("junior"),
  status:          sessionStatusEnum("status").notNull().default("in_progress"),
  messages:        jsonb("messages").notNull().default(sql`'[]'::jsonb`),
  scorecard:       jsonb("scorecard"),
  overallScore:    integer("overall_score"),
  durationSeconds: integer("duration_seconds"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  completedAt:     timestamp("completed_at", { withTimezone: true }),
});


export type User             = typeof users.$inferSelect;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type NewSession       = typeof interviewSessions.$inferInsert;