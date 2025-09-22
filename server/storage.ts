import dotenv from 'dotenv';
dotenv.config();

import { users, servers, bots, ads, serverJoins, slideshows, events, bumpChannels, reviews, partnerships, serverTemplates, templateProcesses, faqs, supportTickets, contactSubmissions, type User, type InsertUser, type Server, type InsertServer, type Bot, type InsertBot, type Ad, type InsertAd, type ServerJoin, type InsertServerJoin, type Slideshow, type InsertSlideshow, type Event, type InsertEvent, type BumpChannel, type InsertBumpChannel, comments, commentLikes, votes, jobs, type Job, type InsertJob, type Faq, type InsertFaq, type SupportTicket, type InsertSupportTicket, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { db } from "@server/db";
import { eq, desc, and, or, ilike, like, sql, isNull, count, asc } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import crypto from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Server operations
  getServers(options?: { tags?: string[]; search?: string; limit?: number; offset?: number; includeNormalAdvertising?: boolean }): Promise<Server[]>;
  getPopularServers(limit?: number): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  getServersByOwner(ownerId: string): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: string, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: string): Promise<boolean>;

  // Bot operations
  getBots(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]>;
  getPopularBots(limit?: number): Promise<Bot[]>;
  getBot(id: string): Promise<Bot | null>;
  getBotsByOwner(ownerId: string): Promise<Bot[]>;
  getBotsByUser(userId: string): Promise<Bot[]>;
  createBot(insertBot: InsertBot): Promise<Bot>;
  updateBot(id: string, bot: Partial<InsertBot>): Promise<Bot | null>;
  deleteBot(id: string): Promise<boolean>;
  voteOnBot(botId: string, userId: string): Promise<{ success: boolean; message: string }>;


  // Ad operations
  getAds(position?: string): Promise<Ad[]>;
  getAd(id: string): Promise<Ad | undefined>;
  createAd(insertAd: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: string): Promise<boolean>;

  // Wallet operations
  getAdvertisingServers(advertisingType?: string): Promise<Server[]>;
  createServerJoin(join: InsertServerJoin): Promise<ServerJoin>;
  hasUserJoinedServer(userId: string, serverId: string): Promise<boolean>;
  getUserCoins(userId: string): Promise<number>;
  updateUserCoins(userId: string, coins: number): Promise<User | undefined>;
  atomicServerJoin(params: { userId: string; serverId: string; coinsToAward: number; currentCoins: number; advertisingMembersNeeded: number }): Promise<{ newBalance: number; advertisingComplete: boolean }>;
  transferCoins(fromUserId: string, toUserId: string, amount: number): Promise<{ success: boolean; fromBalance: number; toBalance: number }>;
  getUserByDiscordUsername(username: string): Promise<User | undefined>;
  addUserCoins(userId: string, amount: number): Promise<void>;


  // Count operations
  getServerCount(): Promise<number>;
  getBotCount(): Promise<number>;

  // Slideshow operations
  getSlideshows(page?: string, includeInactive?: boolean): Promise<Slideshow[]>;
  createSlideshow(slideshow: InsertSlideshow): Promise<Slideshow>;
  updateSlideshow(id: string, slideshow: Partial<InsertSlideshow>): Promise<Slideshow | undefined>;
  deleteSlideshow(id: string): Promise<boolean>;

  // Event operations
  getEvents(options?: { search?: string; limit?: number; offset?: number }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Quest operations
  incrementUserInviteCount(userId: string): Promise<User | undefined>;
  incrementUserReferralCount(userId: string): Promise<User | undefined>;
  updateDailyLoginStreak(userId: string): Promise<User | undefined>;

  // Server leave tracking
  handleServerLeave(userId: string, serverId: string): Promise<{ coinsDeducted: number; newBalance: number } | null>;

  // Bump operations
  getServerByDiscordId(discordId: string): Promise<Server | null>;
  setBumpChannel(guildId: string, channelId: string): Promise<void>;
  removeBumpChannel(guildId: string): Promise<void>;
  getBumpChannel(guildId: string): Promise<BumpChannel | null>;
  getAllBumpChannels(): Promise<BumpChannel[]>;
  getLastBump(guildId: string): Promise<Date | null>;
  updateLastBump(guildId: string): Promise<void>;
  updateServerBumpSettings(serverId: string, bumpEnabled: boolean): Promise<void>;

  // Server boosting operations
  boostServer(serverId: string, userId: string, boostType: '24hours' | '1month'): Promise<Server | undefined>;
  getBoostedServers(): Promise<Server[]>;
  getServersByUser(userId: string): Promise<Server[]>;
  removeExpiredBoosts(): Promise<void>;
  addCoins(userId: string, amount: number): Promise<User | undefined>;

  // Comment operations
  getCommentsForServer(serverId: string, options: { limit: number; offset: number }): Promise<any[]>;
  createComment(data: { serverId: string; userId: string; content: string; parentId?: string | null }): Promise<any>;
  getComment(commentId: string): Promise<any | undefined>;
  deleteComment(commentId: string): Promise<void>;
  toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean }>;
  incrementServerCommentCount(serverId: string): Promise<void>;

  // Voting operations
  voteOnServer(serverId: string, userId: string, voteType: 'up' | 'down'): Promise<{ voteType: 'up' | 'down' | null }>;
  getUserVoteStatus(serverId: string, userId: string): Promise<{ voteType: 'up' | 'down' | null }>;

  // Review operations
  getReview(serverId: string, userId: string): Promise<any | undefined>;
  createReview(reviewData: { serverId: string; userId: string; rating: number; review?: string }): Promise<any>;
  updateReview(reviewId: string, reviewData: { rating?: number; review?: string }): Promise<any | undefined>;
  deleteReview(reviewId: string): Promise<void>;
  getReviewsForServer(serverId: string, options: { limit: number; offset: number }): Promise<any[]>;
  getReviewById(reviewId: string): Promise<any | undefined>;
  updateServerAverageRating(serverId: string): Promise<void>;

  // FAQ operations
  getFaqs(options?: { search?: string; category?: string; isActive?: boolean; limit?: number; offset?: number }): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: string): Promise<boolean>;
  toggleFaqActive(id: string, isActive: boolean): Promise<Faq | undefined>;

  // Support ticket operations
  createSupportTicket(ticketData: InsertSupportTicket & { userId: string }): Promise<SupportTicket>;
  getSupportTickets(options?: { userId?: string; status?: string; limit?: number; offset?: number }): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  updateSupportTicket(id: string, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

  // Contact submission operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;

  // Blog operations
  getBlogPosts(options?: { limit?: number; offset?: number; featured?: boolean }): Promise<any[]>;
  getFeaturedBlogPosts(limit?: number): Promise<any[]>;
  createBlogPost(blogData: any): Promise<any>;

  // Partnerships
  getPartnerships(options: {
    search?: string;
    type?: string;
    limit: number;
    offset: number;
  }): Promise<any[]>;

  createPartnership(partnershipData: any): Promise<any>;
  analyzePartnershipServer(serverLink: string): Promise<any>;

  // Template operations
  getServerTemplates(options?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<any[]>;
  createServerTemplate(template: any): Promise<any>;
  getTemplateByLink(templateLink: string): Promise<any>;
  setPendingTemplate(guildId: string, data: any): Promise<void>;
  getTemplateProcess(guildId: string): Promise<any>;

  // Job operations
  getJobs(options?: { search?: string; type?: string; limit?: number; offset?: number }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor(private db: any) {} // Accept db instance in constructor

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser);
    // Get the created user by Discord ID since MySQL doesn't support returning
    const [user] = await this.db.select().from(users).where(eq(users.discordId, insertUser.discordId));
    return user;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    await this.db.update(users).set(user).where(eq(users.id, id));
    // Get the updated user since MySQL doesn't support returning
    const [updatedUser] = await this.db.select().from(users).where(eq(users.id, id));
    return updatedUser || undefined;
  }

  // Server operations
  async getServers(options: { tags?: string[]; search?: string; limit?: number; offset?: number; includeNormalAdvertising?: boolean } = {}): Promise<Server[]> {
    const { tags = [], search = '', limit = 20, offset = 0, includeNormalAdvertising = false } = options;

    try {
      let query = this.db.select().from(servers);

      // Build WHERE conditions
      const conditions = [];

      if (!includeNormalAdvertising) {
        conditions.push(
          or(
            eq(servers.advertisingType, 'none'),
            isNull(servers.advertisingType)
          )
        );
      }

      if (tags.length > 0) {
        conditions.push(
          or(...tags.map(tag => sql`JSON_CONTAINS(${servers.tags}, ${JSON.stringify(tag)})`))
        );
      }

      if (search) {
        conditions.push(
          or(
            ilike(servers.name, `%${search}%`),
            ilike(servers.description, `%${search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(servers.memberCount))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  }

  async getPopularServers(limit: number = 10): Promise<Server[]> {
    try {
      return await this.db.select()
        .from(servers)
        .where(
          or(
            eq(servers.advertisingType, 'none'),
            isNull(servers.advertisingType)
          )
        )
        .orderBy(desc(servers.memberCount))
        .limit(limit);
    } catch (error) {
      console.error('Failed to fetch popular servers:', error);
      throw error;
    }
  }

  async getServer(id: string): Promise<Server | undefined> {
    const [server] = await this.db.select().from(servers).where(eq(servers.id, id));
    return server || undefined;
  }

  async getServersByOwner(ownerId: string): Promise<Server[]> {
    return await this.db.select().from(servers).where(eq(servers.ownerId, ownerId));
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const [server] = await this.db.insert(servers).values(insertServer).returning();
    return server;
  }

  async updateServer(id: string, server: Partial<InsertServer>): Promise<Server | undefined> {
    const [updatedServer] = await this.db.update(servers).set({ ...server, updatedAt: new Date() }).where(eq(servers.id, id)).returning();
    return updatedServer || undefined;
  }

  async deleteServer(id: string): Promise<boolean> {
    const result = await this.db.delete(servers).where(eq(servers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bot operations
  async getBots(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(bots.name, `%${options.search}%`),
          ilike(bots.description, `%${options.search}%`)
        )
      );
    }

    // Build complete query with all conditions
    const baseQuery = this.db.select().from(bots);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(bots.serverCount));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async getPopularBots(limit = 6): Promise<Bot[]> {
    return await this.db.select().from(bots)
      .orderBy(desc(bots.serverCount))
      .limit(limit);
  }

  async getBot(id: string): Promise<Bot | null> {
    const [bot] = await this.db
      .select()
      .from(bots)
      .where(eq(bots.id, id));
    return bot || null;
  }

  async getBotsByOwner(ownerId: string): Promise<Bot[]> {
    return await this.db.select().from(bots).where(eq(bots.ownerId, ownerId));
  }

  async getBotsByUser(userId: string): Promise<Bot[]> {
    return this.db
      .select()
      .from(bots)
      .where(eq(bots.ownerId, userId))
      .orderBy(desc(bots.createdAt));
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    // Set bots as unverified by default (pending review)
    const botData = {
      ...insertBot,
      verified: false,
      featured: null, // null means pending, false means declined
    };
    const [bot] = await this.db.insert(bots).values(botData).returning();
    return bot;
  }

  async updateBot(id: string, updates: Partial<InsertBot>): Promise<Bot | null> {
    const [updatedBot] = await this.db
      .update(bots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bots.id, id))
      .returning();
    return updatedBot || null;
  }

  async deleteBot(id: string): Promise<boolean> {
    const result = await this.db.delete(bots).where(eq(bots.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async voteOnBot(botId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Check if user already voted in the last 12 hours
    const existingVote = await this.db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.serverId, botId), // Using serverId field for bot votes
          eq(votes.userId, userId),
          sql`${votes.createdAt} > NOW() - INTERVAL 12 HOUR`
        )
      );

    if (existingVote.length > 0) {
      return { success: false, message: "You can only vote once every 12 hours" };
    }

    // Add vote
    await this.db.insert(votes).values({
      serverId: botId, // Using serverId field for bot votes
      userId,
      voteType: "up",
    });

    // Update bot vote count
    await this.db
      .update(bots)
      .set({
        totalVotes: sql`${bots.totalVotes} + 1`
      })
      .where(eq(bots.id, botId));

    return { success: true, message: "Vote recorded successfully" };
  }

  // Ad operations
  async getAds(position?: string): Promise<Ad[]> {
    try {
      let query = this.db.select().from(ads).where(eq(ads.isActive, true));

      if (position) {
        query = query.where(eq(ads.position, position));
      }

      const result = await query.orderBy(desc(ads.createdAt));
      return result || [];
    } catch (error) {
      console.error('Database error in getAds:', error);
      return [];
    }
  }

  async getAd(id: string): Promise<Ad | undefined> {
    const [ad] = await this.db.select().from(ads).where(eq(ads.id, id));
    return ad || undefined;
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    try {
      const [result] = await this.db.insert(ads).values({
        ...insertAd,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // Get the created ad since MySQL doesn't support returning
      const [ad] = await this.db.select().from(ads).where(eq(ads.id, insertAd.id || result.insertId));
      return ad;
    } catch (error) {
      console.error('Database error in createAd:', error);
      throw error;
    }
  }

  async updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined> {
    try {
      await this.db.update(ads)
        .set({
          ...ad,
          updatedAt: new Date()
        })
        .where(eq(ads.id, id));
      // Get the updated ad since MySQL doesn't support returning
      const [updatedAd] = await this.db.select().from(ads).where(eq(ads.id, id));
      return updatedAd;
    } catch (error) {
      console.error('Database error in updateAd:', error);
      throw error;
    }
  }

  async deleteAd(id: string): Promise<boolean> {
    try {
      await this.db.delete(ads).where(eq(ads.id, id));
      return true;
    } catch (error) {
      console.error('Database error in deleteAd:', error);
      return false;
    }
  }

  // Wallet operations
  async getAdvertisingServers(advertisingType?: string): Promise<Server[]> {
    const conditions = [eq(servers.isAdvertising, true)];

    if (advertisingType) {
      conditions.push(eq(servers.advertisingType, advertisingType));
    }

    return await this.db.select().from(servers)
      .where(and(...conditions))
      .orderBy(desc(servers.memberCount));
  }

  async createServerJoin(join: InsertServerJoin): Promise<ServerJoin> {
    const [serverJoin] = await this.db.insert(serverJoins).values(join).returning();
    return serverJoin;
  }

  async hasUserJoinedServer(userId: string, serverId: string): Promise<boolean> {
    const [join] = await this.db.select().from(serverJoins)
      .where(and(eq(serverJoins.userId, userId), eq(serverJoins.serverId, serverId)));
    return !!join;
  }

  async getUserCoins(userId: string): Promise<number> {
    const [user] = await this.db.select({ coins: users.coins }).from(users)
      .where(eq(users.id, userId));
    return user?.coins || 0;
  }

  async updateUserCoins(userId: string, coins: number): Promise<User | undefined> {
    await this.db.update(users)
      .set({ coins })
      .where(eq(users.id, userId));
    // Get the updated user since MySQL doesn't support returning
    const [updatedUser] = await this.db.select().from(users).where(eq(users.id, userId));
    return updatedUser || undefined;
  }

  async transferCoins(fromUserId: string, toUserId: string, amount: number): Promise<{ success: boolean; fromBalance: number; toBalance: number }> {
    if (amount <= 0) {
      throw new Error("Transfer amount must be positive");
    }

    if (fromUserId === toUserId) {
      throw new Error("Cannot transfer coins to yourself");
    }

    return await this.db.transaction(async (tx: any) => {
      // Get current balances
      const [fromUser] = await tx.select().from(users).where(eq(users.id, fromUserId)).for('update');
      const [toUser] = await tx.select().from(users).where(eq(users.id, toUserId)).for('update');

      if (!fromUser) {
        throw new Error("Sender not found");
      }
      if (!toUser) {
        throw new Error("Recipient not found");
      }

      const fromBalance = fromUser.coins || 0;
      if (fromBalance < amount) {
        throw new Error("Insufficient coins");
      }

      const newFromBalance = fromBalance - amount;
      const newToBalance = (toUser.coins || 0) + amount;

      // Update both balances
      await tx.update(users).set({ coins: newFromBalance }).where(eq(users.id, fromUserId));
      await tx.update(users).set({ coins: newToBalance }).where(eq(users.id, toUserId));

      return {
        success: true,
        fromBalance: newFromBalance,
        toBalance: newToBalance
      };
    });
  }

  async getUserByDiscordUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async addUserCoins(userId: string, amount: number): Promise<void> {
    try {
      await this.db
        .update(users)
        .set({
          coins: sql`COALESCE(${users.coins}, 0) + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user coins:', error);
      throw error;
    }
  }

  async incrementUserInviteCount(userId: string) {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    await this.db.update(users)
      .set({ inviteCount: (user.inviteCount || 0) + 1 })
      .where(eq(users.id, userId));

    // Get the updated user since MySQL doesn't support returning
    return await this.getUser(userId);
  }

  async incrementUserReferralCount(userId: string) {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    await this.db.update(users)
      .set({ referralCount: (user.referralCount || 0) + 1 })
      .where(eq(users.id, userId));

    // Get the updated user since MySQL doesn't support returning
    return await this.getUser(userId);
  }

  async updateDailyLoginStreak(userId: string) {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const today = new Date();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

    let newStreak = 1;
    if (lastLogin) {
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = (user.dailyLoginStreak || 0) + 1;
      } else if (daysDiff === 0) {
        // Same day, no change
        return user;
      }
      // If daysDiff > 1, streak resets to 1
    }

    await this.db.update(users)
      .set({
        dailyLoginStreak: newStreak,
        lastLoginDate: today
      })
      .where(eq(users.id, userId));

    // Get the updated user since MySQL doesn't support returning
    return await this.getUser(userId);
  }

  // Handle server leave and coin deduction
  async handleServerLeave(userId: string, serverId: string): Promise<{ coinsDeducted: number; newBalance: number } | null> {
    return await this.db.transaction(async (tx: any) => {
      // Find the server join record
      const [serverJoin] = await tx.select().from(serverJoins)
        .where(and(
          eq(serverJoins.userId, userId),
          eq(serverJoins.serverId, serverId),
          isNull(serverJoins.leftAt) // Only consider active joins
        ));

      if (!serverJoin) {
        return null; // User never joined this server or already processed leave
      }

      const joinDate = new Date(serverJoin.createdAt);
      const leaveDate = new Date();
      const daysDifference = Math.floor((leaveDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      let coinsToDeduct = 0;

      // If user leaves within 3 days, deduct 0.75 coins
      if (daysDifference < 3) {
        coinsToDeduct = 0.75; // This will be stored as integer (75 cents)
      }

      // Update the server join record to mark as left
      await tx.update(serverJoins)
        .set({
          leftAt: leaveDate,
          coinsDeducted: Math.round(coinsToDeduct * 100) // Store as cents
        })
        .where(eq(serverJoins.id, serverJoin.id));

      // Get current user balance and deduct coins if necessary
      const [currentUser] = await tx.select({ coins: users.coins }).from(users)
        .where(eq(users.id, userId));

      if (!currentUser) {
        throw new Error("User not found");
      }

      const currentCoins = currentUser.coins || 0;
      const newBalance = Math.max(0, currentCoins - coinsToDeduct);

      // Update user coins
      if (coinsToDeduct > 0) {
        await tx.update(users)
          .set({ coins: newBalance })
          .where(eq(users.id, userId));
      }

      return {
        coinsDeducted: coinsToDeduct,
        newBalance: newBalance
      };
    });
  }

  // Slideshow operations
  async getSlideshows(page?: string, includeInactive?: boolean): Promise<Slideshow[]> {
    try {
      let whereConditions = [];

      if (!includeInactive) {
        whereConditions.push(eq(slideshows.isActive, true));
      }

      // If page is specified, filter by page
      if (page) {
        // Note: Add page field to slideshow schema if needed
        // For now, return all slideshows
      }

      const query = whereConditions.length > 0
        ? this.db.select().from(slideshows).where(and(...whereConditions))
        : this.db.select().from(slideshows);

      const result = await query.orderBy(asc(slideshows.order));
      return result || [];
    } catch (error) {
      console.error('Database error in getSlideshows:', error);
      return [];
    }
  }

  async createSlideshow(insertSlideshow: InsertSlideshow): Promise<Slideshow> {
    try {
      const [result] = await this.db.insert(slideshows).values({
        ...insertSlideshow,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // Get the created slideshow since MySQL doesn't support returning
      const [slideshow] = await this.db.select().from(slideshows).where(eq(slideshows.id, insertSlideshow.id || result.insertId));
      return slideshow;
    } catch (error) {
      console.error('Database error in createSlideshow:', error);
      throw error;
    }
  }

  async updateSlideshow(id: string, updateData: Partial<InsertSlideshow>): Promise<Slideshow | undefined> {
    try {
      await this.db.update(slideshows)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(slideshows.id, id));
      // Get the updated slideshow since MySQL doesn't support returning
      const [slideshow] = await this.db.select().from(slideshows).where(eq(slideshows.id, id));
      return slideshow;
    } catch (error) {
      console.error('Database error in updateSlideshow:', error);
      throw error;
    }
  }

  async deleteSlideshow(id: string): Promise<boolean> {
    try {
      await this.db.delete(slideshows).where(eq(slideshows.id, id));
      return true;
    } catch (error) {
      console.error('Database error in deleteSlideshow:', error);
      return false;
    }
  }

  // Event operations
  async getEvents(options?: { search?: string; limit?: number; offset?: number }): Promise<Event[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(events.title, `%${options.search}%`),
          ilike(events.description, `%${options.search}%`)
        )
      );
    }

    const baseQuery = this.db.select().from(events);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(events.startDate));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await this.db.insert(events).values(insertEvent).returning();
    return event;
  }

  // ATOMIC SERVER JOIN: Prevents race conditions and double-awarding of coins
  async atomicServerJoin(params: {
    userId: string;
    serverId: string;
    coinsToAward: number;
    currentCoins: number;
    advertisingMembersNeeded: number
  }): Promise<{ newBalance: number; advertisingComplete: boolean }> {
    const { userId, serverId, coinsToAward } = params;

    return await this.db.transaction(async (tx: any) => {
      // Fetch current user and server state inside transaction for consistency
      const [currentUser] = await tx.select({ coins: users.coins }).from(users)
        .where(eq(users.id, userId));

      const [currentServer] = await tx.select({
        advertisingMembersNeeded: servers.advertisingMembersNeeded,
        isAdvertising: servers.isAdvertising,
        advertisingType: servers.advertisingType
      }).from(servers)
        .where(eq(servers.id, serverId));

      if (!currentUser) {
        throw new Error("User not found");
      }
      if (!currentServer) {
        throw new Error("Server not found");
      }
      if (!currentServer.isAdvertising || (currentServer.advertisingMembersNeeded || 0) <= 0) {
        throw new Error("Server is not currently advertising or quota exhausted");
      }
      if (currentServer.advertisingType !== "member_exchange") {
        throw new Error("Coins can only be earned from member-exchange advertising servers");
      }

      try {
        // Insert server join record - unique constraint will prevent duplicates
        await tx.insert(serverJoins).values({
          userId,
          serverId,
          coinsEarned: coinsToAward,
        });
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          throw new Error("You have already earned coins from this server");
        }
        throw error;
      }

      // Atomically increment user coins using SQL operation (prevents lost updates)
      await tx.update(users)
        .set({ coins: sql`${users.coins} + ${coinsToAward}` })
        .where(eq(users.id, userId));

      // Get updated user coins since MySQL doesn't support returning
      const [updatedUser] = await tx.select({ coins: users.coins }).from(users).where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Failed to update user coins");
      }

      // Conditionally update advertising accounting with WHERE guards
      const newMembersNeeded = Math.max(0, (currentServer.advertisingMembersNeeded || 0) - 1);
      const advertisingComplete = newMembersNeeded <= 0;

      const updateResult = await tx.update(servers)
        .set({
          advertisingMembersNeeded: newMembersNeeded,
          isAdvertising: !advertisingComplete,
        })
        .where(and(
          eq(servers.id, serverId),
          eq(servers.isAdvertising, true),
          sql`${servers.advertisingMembersNeeded} > 0`
        ));

      // Check if any rows were affected (MySQL doesn't support returning)
      if (updateResult.affectedRows === 0) {
        throw new Error("Server advertising quota was exhausted during transaction");
      }

      return {
        newBalance: updatedUser.coins || 0,
        advertisingComplete
      };
    });
  }

  // Bump functionality methods
  async getServerByDiscordId(discordId: string): Promise<Server | null> {
    const result = await this.db
      .select()
      .from(servers)
      .where(eq(servers.discordId, discordId))
      .limit(1);
    return result[0] || null;
  }

  async setBumpChannel(guildId: string, channelId: string): Promise<void> {
    await this.db
      .insert(bumpChannels)
      .values({ guildId, channelId })
      .onConflictDoUpdate({
        target: bumpChannels.guildId,
        set: { channelId, updatedAt: new Date() }
      });
  }

  async removeBumpChannel(guildId: string): Promise<void> {
    await this.db
      .delete(bumpChannels)
      .where(eq(bumpChannels.guildId, guildId));
  }

  async getBumpChannel(guildId: string): Promise<BumpChannel | null> {
    const result = await this.db
      .select()
      .from(bumpChannels)
      .where(eq(bumpChannels.guildId, guildId))
      .limit(1);
    return result[0] || null;
  }

  async getAllBumpChannels(): Promise<BumpChannel[]> {
    return await this.db.select().from(bumpChannels);
  }

  async getLastBump(guildId: string): Promise<Date | null> {
    const result = await this.db
      .select({ lastBumpAt: servers.lastBumpAt })
      .from(servers)
      .where(eq(servers.discordId, guildId))
      .limit(1);
    return result[0]?.lastBumpAt || null;
  }

  async updateLastBump(guildId: string): Promise<void> {
    await this.db
      .update(servers)
      .set({ lastBumpAt: new Date() })
      .where(eq(servers.discordId, guildId));
  }

  async updateServerBumpSettings(serverId: string, bumpEnabled: boolean): Promise<void> {
    await this.db
      .update(servers)
      .set({ bumpEnabled })
      .where(eq(servers.id, serverId));
  }

  // Comments
  async getCommentsForServer(serverId: string, options: { limit: number; offset: number }) {
    const result = await this.db
      .select({
        id: comments.id,
        content: comments.content,
        likes: comments.likes,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        isEdited: comments.isEdited,
        isPinned: comments.isPinned,
        user: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.serverId, serverId))
      .orderBy(desc(comments.isPinned), desc(comments.createdAt))
      .limit(options.limit)
      .offset(options.offset);

    return result;
  }

  async createComment(data: { serverId: string; userId: string; content: string; parentId?: string | null }) {
    const [comment] = await this.db
      .insert(comments)
      .values({
        serverId: data.serverId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId,
      })
      .returning();

    return comment;
  }

  async getComment(commentId: string) {
    const [comment] = await this.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    return comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.db.delete(comments).where(eq(comments.id, commentId));
  }

  async toggleCommentLike(commentId: string, userId: string) {
    // Check if user already liked the comment
    const [existingLike] = await this.db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));

    if (existingLike) {
      // Remove like
      await this.db
        .delete(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));

      // Decrement like count
      await this.db
        .update(comments)
        .set({ likes: sql`${comments.likes} - 1` })
        .where(eq(comments.id, commentId));

      return { liked: false };
    } else {
      // Add like
      await this.db.insert(commentLikes).values({
        commentId,
        userId,
      });

      // Increment like count
      await this.db
        .update(comments)
        .set({ likes: sql`${comments.likes} + 1` })
        .where(eq(comments.id, commentId));

      return { liked: true };
    }
  }

  async incrementServerCommentCount(serverId: string): Promise<void> {
    await this.db
      .update(servers)
      .set({ totalComments: sql`${servers.totalComments} + 1` })
      .where(eq(servers.id, serverId));
  }

  // Voting
  async voteOnServer(serverId: string, userId: string, voteType: 'up' | 'down') {
    // Check if user already voted
    const [existingVote] = await this.db
      .select()
      .from(votes)
      .where(and(eq(votes.serverId, serverId), eq(votes.userId, userId)));

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await this.db
          .delete(votes)
          .where(and(eq(votes.serverId, serverId), eq(votes.userId, userId)));

        // Update server vote counts
        if (voteType === 'up') {
          await this.db
            .update(servers)
            .set({ upvotes: sql`${servers.upvotes} - 1` })
            .where(eq(servers.id, serverId));
        } else {
          await this.db
            .update(servers)
            .set({ downvotes: sql`${servers.downvotes} - 1` })
            .where(eq(servers.id, serverId));
        }

        return { voteType: null };
      } else {
        // Change vote type
        await this.db
          .update(votes)
          .set({ voteType })
          .where(and(eq(votes.serverId, serverId), eq(votes.userId, userId)));

        // Update server vote counts
        if (voteType === 'up') {
          await this.db
            .update(servers)
            .set({
              upvotes: sql`${servers.upvotes} + 1`,
              downvotes: sql`${servers.downvotes} - 1`
            })
            .where(eq(servers.id, serverId));
        } else {
          await this.db
            .update(servers)
            .set({
              upvotes: sql`${servers.upvotes} - 1`,
              downvotes: sql`${servers.downvotes} + 1`
            })
            .where(eq(servers.id, serverId));
        }

        return { voteType };
      }
    } else {
      // Create new vote
      await this.db.insert(votes).values({
        serverId,
        userId,
        voteType,
      });

      // Update server vote counts
      if (voteType === 'up') {
        await this.db
          .update(servers)
          .set({ upvotes: sql`${servers.upvotes} + 1` })
          .where(eq(servers.id, serverId));
      } else {
        await this.db
          .update(servers)
          .set({ downvotes: sql`${servers.downvotes} + 1` })
          .where(eq(servers.id, serverId));
      }

      return { voteType };
    }
  }

  async getUserVoteStatus(serverId: string, userId: string): Promise<{ voteType: 'up' | 'down' | null }> {
    const [vote] = await this.db
      .select()
      .from(votes)
      .where(and(eq(votes.serverId, serverId), eq(votes.userId, userId)));

    return { voteType: (vote?.voteType as 'up' | 'down') || null };
  }

  // Partnerships
  async getPartnerships(options: {
    search?: string;
    type?: string;
    limit: number;
    offset: number;
  }) {
    try {
      let query = this.db
        .select({
          id: partnerships.id,
          title: partnerships.title,
          description: partnerships.description,
          serverName: partnerships.serverName,
          serverIcon: partnerships.serverIcon,
          memberCount: partnerships.memberCount,
          partnershipType: partnerships.partnershipType,
          requirements: partnerships.requirements,
          benefits: partnerships.benefits,
          contactInfo: partnerships.contactInfo,
          discordLink: partnerships.discordLink,
          verified: partnerships.verified,
          featured: partnerships.featured,
          createdAt: partnerships.createdAt,
          ownerUsername: users.username,
        })
        .from(partnerships)
        .leftJoin(users, eq(partnerships.ownerId, users.id))
        .orderBy(desc(partnerships.createdAt))
        .limit(options.limit)
        .offset(options.offset);

      if (options.search) {
        query = query.where(
          or(
            ilike(partnerships.title, `%${options.search}%`),
            ilike(partnerships.description, `%${options.search}%`),
            ilike(partnerships.serverName, `%${options.search}%`)
          )
        );
      }

      if (options.type && options.type !== "all") {
        query = query.where(eq(partnerships.partnershipType, options.type));
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error("Database error fetching partnerships:", error);
      return [];
    }
  }

  async createPartnership(partnershipData: any) {
    try {
      const [partnership] = await this.db
        .insert(partnerships)
        .values({
          ...partnershipData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return partnership;
    } catch (error) {
      console.error("Database error creating partnership:", error);
      throw new Error("Failed to create partnership in database");
    }
  }

  async analyzePartnershipServer(serverLink: string): Promise<any> {
    // Mock server analysis for now - in real implementation, this would use Discord API
    // Extract invite code from the server link
    const inviteCode = serverLink.match(/discord\.gg\/([a-zA-Z0-9]+)/)?.[1] ||
                      serverLink.match(/discordapp\.com\/invite\/([a-zA-Z0-9]+)/)?.[1];

    if (!inviteCode) {
      throw new Error('Invalid Discord invite link');
    }

    // Mock data - in real implementation, fetch from Discord API
    return {
      serverName: "Example Gaming Server",
      serverIcon: "https://cdn.discordapp.com/icons/123456789/example.png",
      memberCount: Math.floor(Math.random() * 10000) + 100,
      verified: Math.random() > 0.7,
    };
  }

  // Server Templates
  async getServerTemplates(options: {
    search?: string;
    category?: string;
    limit: number;
    offset: number;
  }) {
    try {
      let query = this.db
        .select({
          id: serverTemplates.id,
          name: serverTemplates.name,
          description: serverTemplates.description,
          category: serverTemplates.category,
          previewImage: serverTemplates.previewImage,
          channels: serverTemplates.channels,
          roles: serverTemplates.roles,
          templateLink: serverTemplates.templateLink,
          downloads: serverTemplates.downloads,
          rating: serverTemplates.rating,
          createdBy: users.username,
          verified: serverTemplates.verified,
          featured: serverTemplates.featured,
          createdAt: serverTemplates.createdAt,
        })
        .from(serverTemplates)
        .leftJoin(users, eq(serverTemplates.ownerId, users.id))
        .orderBy(desc(serverTemplates.createdAt))
        .limit(options.limit)
        .offset(options.offset);

      if (options.search) {
        query = query.where(
          or(
            ilike(serverTemplates.name, `%${options.search}%`),
            ilike(serverTemplates.description, `%${options.search}%`)
          )
        );
      }

      if (options.category && options.category !== "all") {
        query = query.where(eq(serverTemplates.category, options.category));
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error("Database error fetching server templates:", error);
      return [];
    }
  }

  async createServerTemplate(templateData: any) {
    try {
      const [template] = await this.db
        .insert(serverTemplates)
        .values({
          ...templateData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return template;
    } catch (error) {
      console.error("Database error creating server template:", error);
      throw new Error("Failed to create server template in database");
    }
  }

  async getTemplateByLink(templateLink: string) {
    try {
      const [template] = await this.db
        .select()
        .from(serverTemplates)
        .where(eq(serverTemplates.templateLink, templateLink));

      return template || null;
    } catch (error) {
      console.error("Database error getting template by link:", error);
      return null;
    }
  }

  async setPendingTemplate(guildId: string, data: any) {
    // Pending template storage not implemented yet
    console.log(`Template functionality not available for guild ${guildId}`);
  }

  async getTemplateProcess(guildId: string) {
    // Mock implementation - would query database
    return {
      templateName: 'Gaming Template',
      status: 'In Progress',
      startedAt: Date.now() - 30000, // 30 seconds ago
      channelsDeleted: 5,
      rolesDeleted: 3,
      channelsCreated: 8,
      rolesCreated: 4,
      totalChannels: 12,
      totalRoles: 6,
      eta: '2 minutes',
      errors: [],
    };
  }

  // Guild Settings
  async updateGuildSettings(guildId: string, settings: any): Promise<void> {
    // For now, we'll store guild settings in a simple way
    // In a real implementation, you'd have a proper guildSettings table
    console.log(`Updating guild settings for ${guildId}:`, settings);
  }

  // Reaction Roles
  async addReactionRole(guildId: string, messageId: string, emoji: string, roleId: string): Promise<void> {
    // Store reaction role data
    // In a real implementation, you'd have a proper reactionRoles table
    console.log(`Adding reaction role: ${guildId} ${messageId} ${emoji} ${roleId}`);
  }

  async getReactionRole(guildId: string, messageId: string, emoji: string): Promise<any> {
    // Get reaction role data
    // In a real implementation, you'd query the reactionRoles table
    console.log(`Getting reaction role: ${guildId} ${messageId} ${emoji}`);
    return null; // Placeholder
  }

  // Review operations implementation
  async getReview(serverId: string, userId: string): Promise<any | undefined> {
    const [review] = await this.db.select().from(reviews).where(and(eq(reviews.serverId, serverId), eq(reviews.userId, userId))).limit(1);
    return review;
  }

  async createReview(reviewData: { serverId: string; userId: string; rating: number; review?: string }): Promise<any> {
    const [newReview] = await this.db.insert(reviews).values(reviewData).returning();
    await this.updateServerAverageRating(reviewData.serverId);
    return newReview;
  }

  async updateReview(reviewId: string, reviewData: { rating?: number; review?: string }): Promise<any | undefined> {
    const [updatedReview] = await this.db.update(reviews).set({ ...reviewData, updatedAt: sql`now()` }).where(eq(reviews.id, reviewId)).returning();
    if (updatedReview) {
      await this.updateServerAverageRating(updatedReview.serverId);
    }
    return updatedReview;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await this.db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
    await this.db.delete(reviews).where(eq(reviews.id, reviewId));
    if (review[0]) {
      await this.updateServerAverageRating(review[0].serverId);
    }
  }

  async getReviewsForServer(serverId: string, options: { limit: number; offset: number }): Promise<any[]> {
    return await this.db.select().from(reviews).where(eq(reviews.serverId, serverId))
      .orderBy(desc(reviews.createdAt))
      .limit(options.limit)
      .offset(options.offset);
  }

  async getReviewById(reviewId: string): Promise<any | undefined> {
    const [review] = await this.db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
    return review;
  }

  async updateServerAverageRating(serverId: string): Promise<void> {
    const result = await this.db.select({
      avgRating: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`
    }).from(reviews).where(eq(reviews.serverId, serverId));

    const avgRating = result[0]?.avgRating || 0;
    await this.db.update(servers).set({
      averageRating: avgRating,
      totalReviews: result[0]?.count || 0
    }).where(eq(servers.id, serverId));
  }

  // FAQ operations implementation
  async getFaqs(options?: { search?: string; category?: string; isActive?: boolean; limit?: number; offset?: number }): Promise<Faq[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          like(faqs.question, `%${options.search}%`),
          like(faqs.answer, `%${options.search}%`)
        )
      );
    }

    if (options?.category) {
      conditions.push(eq(faqs.category, options.category));
    }

    if (options?.isActive !== undefined) {
      conditions.push(eq(faqs.isActive, options.isActive));
    }

    const baseQuery = this.db.select().from(faqs);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(faqs.order, desc(faqs.createdAt));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const [newFaq] = await this.db.insert(faqs).values({
      ...faq,
      updatedAt: new Date()
    }).returning();
    return newFaq;
  }

  async updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq | undefined> {
    const [updatedFaq] = await this.db.update(faqs).set({
      ...faq,
      updatedAt: new Date()
    }).where(eq(faqs.id, id)).returning();
    return updatedFaq || undefined;
  }

  async deleteFaq(id: string): Promise<boolean> {
    const result = await this.db.delete(faqs).where(eq(faqs.id, id));
    return result.affectedRows > 0;
  }

  async toggleFaqActive(id: string, isActive: boolean): Promise<Faq | undefined> {
    const [updatedFaq] = await this.db.update(faqs).set({
      isActive,
      updatedAt: new Date()
    }).where(eq(faqs.id, id)).returning();
    return updatedFaq || undefined;
  }

  // Support ticket operations implementation
  async createSupportTicket(ticketData: InsertSupportTicket & { userId: string }): Promise<SupportTicket> {
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now().toString().slice(-8)}`;

    const [newTicket] = await this.db.insert(supportTickets).values({
      ...ticketData,
      ticketId,
      updatedAt: new Date()
    }).returning();
    return newTicket;
  }

  async getSupportTickets(options?: { userId?: string; status?: string; limit?: number; offset?: number }): Promise<SupportTicket[]> {
    const conditions = [];

    if (options?.userId) {
      conditions.push(eq(supportTickets.userId, options.userId));
    }

    if (options?.status) {
      conditions.push(eq(supportTickets.status, options.status));
    }

    const baseQuery = this.db.select().from(supportTickets);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(supportTickets.createdAt));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await this.db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async updateSupportTicket(id: string, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await this.db.update(supportTickets).set({
      ...ticketData,
      updatedAt: new Date()
    }).where(eq(supportTickets.id, id)).returning();
    return updatedTicket || undefined;
  }

  // Contact submission operations implementation
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await this.db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Blog operations implementation
  async getBlogPosts(options: { limit?: number; offset?: number; featured?: boolean } = {}): Promise<any[]> {
    // Mock implementation - no blog table exists yet
    return [];
  }

  async getFeaturedBlogPosts(limit: number = 5): Promise<any[]> {
    // Mock implementation - no blog table exists yet
    return [];
  }

  async createBlogPost(blogData: any): Promise<any> {
    // Mock implementation - no blog table exists yet
    return { id: 'mock-blog-id', ...blogData };
  }

  // Job operations
  async getJobs(options?: { search?: string; type?: string; limit?: number; offset?: number }): Promise<Job[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${options.search}%`),
          ilike(jobs.description, `%${options.search}%`)
        )
      );
    }

    if (options?.type && options.type !== 'all') {
      conditions.push(eq(jobs.type, options.type));
    }

    const baseQuery = this.db.select().from(jobs);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(jobs.createdAt));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await this.db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await this.db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await this.db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Server boosting operations
  async boostServer(serverId: string, userId: string, boostType: '24hours' | '1month'): Promise<Server | undefined> {
    const boostDuration = boostType === '24hours' ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000; // 24 hours or 30 days in milliseconds
    const boostExpiresAt = new Date(Date.now() + boostDuration);
    const boostPriority = boostType === '24hours' ? 1 : 2; // 1month gets higher priority

    const [updatedServer] = await this.db.update(servers).set({
      isBoosted: true,
      boostExpiresAt,
      boostType,
      boostedById: userId,
      boostedAt: new Date(),
      boostPriority,
      updatedAt: new Date()
    }).where(eq(servers.id, serverId)).returning();

    return updatedServer || undefined;
  }

  async getBoostedServers(): Promise<Server[]> {
    const now = new Date();
    return await this.db.select().from(servers)
      .where(and(
        eq(servers.isBoosted, true),
        sql`${servers.boostExpiresAt} > ${now}`
      ))
      .orderBy(desc(servers.boostPriority), desc(servers.boostedAt));
  }

  async getServersByUser(userId: string): Promise<Server[]> {
    return await this.db.select().from(servers).where(eq(servers.ownerId, userId));
  }

  async removeExpiredBoosts(): Promise<void> {
    const now = new Date();
    await this.db.update(servers).set({
      isBoosted: false,
      boostExpiresAt: null,
      boostType: "none",
      boostedById: null,
      boostedAt: null,
      boostPriority: 0,
      updatedAt: new Date()
    }).where(and(
      eq(servers.isBoosted, true),
      sql`${servers.boostExpiresAt} <= ${now}`
    ));
  }

  async addCoins(userId: string, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newBalance = (user.coins || 0) + amount;
    return await this.updateUserCoins(userId, newBalance);
  }

  // Count operations
  async getServerCount(): Promise<number> {
    const [result] = await this.db.select({ count: sql<number>`count(*)` }).from(servers);
    return result?.count || 0;
  }

  async getBotCount(): Promise<number> {
    const [result] = await this.db.select({ count: sql<number>`count(*)` }).from(bots);
    return result?.count || 0;
  }
}

if (!db) {
  throw new Error("Database connection failed. Please check your database credentials in .env file.");
}

export const storage = new DatabaseStorage(db);
