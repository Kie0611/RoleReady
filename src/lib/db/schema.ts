import {
  pgTable, pgEnum, uuid, varchar, text,
  integer, timestamp, jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const interviewTypeEnum = pgEnum("interview_type", [
  "behavioral",
  "technical",
  "mixed",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const difficultyEnum = pgEnum("difficulty_level", [
  "junior",
  "mid",
  "senior",
]);

// Users — managed by NextAuth + Drizzle adapter
export const users = pgTable("users", {
  id:            uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name:          varchar("name", { length: 255 }),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image:         text("image"),
  passwordHash:  text("password_hash"),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// Required by NextAuth Drizzle adapter
export const accounts = pgTable("accounts", {
  id:                uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              varchar("type", { length: 255 }).notNull(),
  provider:          varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refreshToken:      text("refresh_token"),
  accessToken:       text("access_token"),
  expiresAt:         integer("expires_at"),
  tokenType:         varchar("token_type", { length: 255 }),
  scope:             varchar("scope", { length: 255 }),
  idToken:           text("id_token"),
  sessionState:      varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  id:           uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token:      varchar("token", { length: 255 }).notNull(),
  expires:    timestamp("expires", { withTimezone: true }).notNull(),
});

// Interview sessions
export const interviewSessions = pgTable("interview_sessions", {
  id:            uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:        uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role:          varchar("role", { length: 255 }).notNull(),
  company:       varchar("company", { length: 255 }),
  jobDescription:text("job_description"),
  interviewType: interviewTypeEnum("interview_type").notNull().default("mixed"),
  difficulty:    difficultyEnum("difficulty").notNull().default("junior"),
  status:        sessionStatusEnum("status").notNull().default("in_progress"),

  // Stored as JSONB — array of { role: "user"|"assistant", content: string }
  messages:      jsonb("messages").notNull().default(sql`'[]'::jsonb`),

  // Scorecard stored as JSONB after session completes
  scorecard:     jsonb("scorecard"),

  // Overall score 0–100
  overallScore:  integer("overall_score"),

  durationSeconds: integer("duration_seconds"),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  completedAt:   timestamp("completed_at", { withTimezone: true }),
});

// Inferred types
export type User              = typeof users.$inferSelect;
export type InterviewSession  = typeof interviewSessions.$inferSelect;
export type NewSession        = typeof interviewSessions.$inferInsert;
