import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  company: text("company"),
  plan: text("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  greeting: text("greeting").notNull().default("Hi, how can I help you today?"),
  voice: text("voice").default("alloy").notNull(),
  model: text("model").default("llama-3.3-70b-versatile").notNull(),
  language: text("language").default("en").notNull(),
  maxCallDuration: integer("max_call_duration").default(300).notNull(),
  active: boolean("active").default(true).notNull(),
  twilioPhoneNumber: text("twilio_phone_number"),
  webhookUrl: text("webhook_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calls = pgTable("calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  callerNumber: text("caller_number"),
  source: text("source").default("web").notNull(), // web, phone, widget
  status: text("status").default("active").notNull(), // active, completed, failed
  duration: integer("duration").default(0),
  transcript: jsonb("transcript").$type<{ role: string; content: string; timestamp: string }[]>(),
  summary: text("summary"),
  sentiment: text("sentiment"),
  twilioCallSid: text("twilio_call_sid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
