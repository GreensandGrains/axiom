import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, boolean, json, decimal } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  discordId: varchar("discord_id", { length: 32 }).notNull().unique(),
  username: text("username").notNull(),
  discriminator: varchar("discriminator", { length: 4 }),
  avatar: text("avatar"),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  discordAccessToken: text("discord_access_token"),
  coins: int("coins").default(0),
  inviteCount: int("invite_count").default(0),
  serversJoined: int("servers_joined").default(0),
  dailyLoginStreak: int("daily_login_streak").default(0),
  referralCount: int("referral_count").default(0),
  questsClaimed: json("quests_claimed").default([]),
  lastLoginDate: timestamp("last_login_date"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = mysqlTable("servers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  serverId: varchar("server_id", { length: 32 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  inviteLink: varchar("invite_link", { length: 255 }).notNull(),
  tags: json("tags").default([]),
  category: varchar("category", { length: 100 }).notNull(),
  memberCount: int("member_count").default(0),
  onlineCount: int("online_count").default(0),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  nsfw: boolean("nsfw").default(false),
  premium: boolean("premium").default(false),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  ownerUsername: text("owner_username"),
  totalVotes: int("total_votes").default(0),
  totalReviews: int("total_reviews").default(0),
  averageRating: int("average_rating").default(0),
  totalComments: int("total_comments").default(0),
  advertisingUserId: varchar("advertising_user_id", { length: 36 }),
  advertisingType: varchar("advertising_type", { length: 50 }),
  advertisingExpiry: timestamp("advertising_expiry"),
  bumpEnabled: boolean("bump_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bots = mysqlTable("bots", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  botId: varchar("bot_id", { length: 32 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  inviteLink: varchar("invite_link", { length: 255 }).notNull(),
  supportServerInvite: varchar("support_server_invite", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 255 }),
  githubUrl: varchar("github_url", { length: 255 }),
  tags: json("tags").default([]),
  category: varchar("category", { length: 100 }).notNull(),
  serverCount: int("server_count").default(0),
  shardCount: int("shard_count").default(0),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  prefix: text("prefix"),
  iconUrl: text("icon_url"),
  uses: text("uses").notNull(),
  type: text("type").notNull(),
  totalVotes: int("total_votes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = mysqlTable("events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  organizer: text("organizer").notNull(),
  maxParticipants: int("max_participants"),
  currentParticipants: int("current_participants").default(0),
  tags: json("tags").default([]),
  featured: boolean("featured").default(false),
  approved: boolean("approved").default(false),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  serverId: varchar("server_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ads = mysqlTable("ads", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  targetUrl: varchar("target_url", { length: 500 }),
  linkUrl: varchar("link_url", { length: 500 }),
  position: varchar("position", { length: 50 }).notNull().default("sidebar"),
  isActive: boolean("is_active").notNull().default(true),
  impressions: int("impressions").notNull().default(0),
  clicks: int("clicks").notNull().default(0),
  budget: decimal("budget", { precision: 10, scale: 2 }).default("0.00"),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const slideshows = mysqlTable("slideshows", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: varchar("link_url", { length: 255 }),
  isActive: boolean("is_active").default(true),
  order: int("order").default(0),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serverJoins = mysqlTable("server_joins", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  targetServerId: varchar("target_server_id", { length: 32 }).notNull(),
  memberCount: int("member_count").notNull(),
  price: int("price").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  paymentId: varchar("payment_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bumpChannels = mysqlTable("bump_channels", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  serverId: varchar("server_id", { length: 32 }).notNull(),
  channelId: varchar("channel_id", { length: 32 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  lastBumpAt: timestamp("last_bump_at"),
  bumpCount: int("bump_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  serverId: varchar("server_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  helpful: int("helpful").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  serverId: varchar("server_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  parentId: varchar("parent_id", { length: 36 }),
  likes: int("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentLikes = mysqlTable("comment_likes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  commentId: varchar("comment_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = mysqlTable("votes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  serverId: varchar("server_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  voteType: varchar("vote_type", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerships = mysqlTable("partnerships", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  benefits: text("benefits").notNull(),
  contactInfo: text("contact_info").notNull(),
  imageUrl: text("image_url"),
  serverId: varchar("server_id", { length: 32 }),
  tags: json("tags").default([]),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serverTemplates = mysqlTable("server_templates", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  tags: json("tags").default([]),
  channels: json("channels").notNull(),
  roles: json("roles").notNull(),
  settings: json("settings").notNull(),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  downloads: int("downloads").default(0),
  rating: int("rating").default(0),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templateProcesses = mysqlTable("template_processes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  templateId: varchar("template_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  serverId: varchar("server_id", { length: 32 }),
  status: varchar("status", { length: 20 }).default("pending"),
  progress: int("progress").default(0),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const jobs = mysqlTable("jobs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  requirements: text("requirements"),
  salary: text("salary"),
  benefits: text("benefits"),
  applicationUrl: varchar("application_url", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  tags: json("tags").default([]),
  featured: boolean("featured").default(false),
  remote: boolean("remote").default(false),
  active: boolean("active").default(true),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Relations remain the same
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
  bots: many(bots),
  events: many(events),
  ads: many(ads),
  reviews: many(reviews),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  comments: many(comments),
  votes: many(votes),
}));

export const botsRelations = relations(bots, ({ one }) => ({
  owner: one(users, {
    fields: [bots.ownerId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [events.serverId],
    references: [servers.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;
export type Slideshow = typeof slideshows.$inferSelect;
export type InsertSlideshow = typeof slideshows.$inferInsert;
export type ServerJoin = typeof serverJoins.$inferSelect;
export type InsertServerJoin = typeof serverJoins.$inferInsert;
export type BumpChannel = typeof bumpChannels.$inferSelect;
export type InsertBumpChannel = typeof bumpChannels.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;
export type ServerTemplate = typeof serverTemplates.$inferSelect;
export type InsertServerTemplate = typeof serverTemplates.$inferInsert;
export type TemplateProcess = typeof templateProcesses.$inferSelect;
export type InsertTemplateProcess = typeof templateProcesses.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Schema validations
export const insertUserSchema = createInsertSchema(users);
export const insertServerSchema = createInsertSchema(servers);
export const insertBotSchema = createInsertSchema(bots);
export const insertEventSchema = createInsertSchema(events);
export const insertAdSchema = createInsertSchema(ads);
export const insertSlideshowSchema = createInsertSchema(slideshows);
export const insertServerJoinSchema = createInsertSchema(serverJoins);
export const insertBumpChannelSchema = createInsertSchema(bumpChannels);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertCommentSchema = createInsertSchema(comments);
export const insertVoteSchema = createInsertSchema(votes);
export const insertPartnershipSchema = createInsertSchema(partnerships);
export const insertServerTemplateSchema = createInsertSchema(serverTemplates);
export const insertTemplateProcessSchema = createInsertSchema(templateProcesses);
export const insertJobSchema = createInsertSchema(jobs);

// FAQs table for help center
export const faqs = mysqlTable("faqs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: json("tags").default([]),
  isActive: boolean("is_active").default(true),
  order: int("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Support tickets table
export const supportTickets = mysqlTable("support_tickets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  ticketId: varchar("ticket_id", { length: 20 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  subject: text("subject").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  assignedTo: varchar("assigned_to", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ 
  id: true, 
  ticketId: true, 
  userId: true, 
  status: true, 
  assignedTo: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Contact form submissions table
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ 
  id: true, 
  status: true, 
  createdAt: true 
});
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;