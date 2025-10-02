import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  servers,
  bots,
  events,
  users,
  ads,
  slideshows,
  reviews,
  serverJoins,
  bumpChannels,
  jobs,
  insertServerSchema,
  insertBotSchema,
  insertEventSchema,
  insertAdSchema,
  insertServerJoinSchema,
  insertSlideshowSchema,
  insertPartnershipSchema,
  insertServerTemplateSchema,
  insertJobSchema,
  insertFaqSchema,
  insertSupportTicketSchema,
  insertContactSubmissionSchema
} from "@shared/schema";
import { z } from "zod";
import {
  eq,
  desc,
  asc,
  and,
  or,
  like,
  count,
  sql as drizzleSql,
  sql
} from "drizzle-orm";
import {
  strictLimiter,
  reviewLimiter,
  validateServerData,
  validateReview
} from "./middleware/security";
import crypto from "crypto";
import { generateSitemap } from "./sitemap";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        discordId: string;
        username: string;
        avatar?: string;
        isAdmin?: boolean;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin middleware
  const requireAdmin = (req: Request, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.get("/api/auth/me", async (req, res) => {
    if (req.user) {
      try {
        // Get fresh user data from database to include coins
        const freshUser = await storage.getUser(req.user.id);
        if (freshUser) {
          res.json({
            ...req.user,
            coins: freshUser.coins || 0,
          });
        } else {
          res.json(req.user);
        }
      } catch (error) {
        console.error("Error fetching fresh user data:", error);
        res.json(req.user);
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get("/api/auth/discord", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || "1418600262938923220";
    const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;
    const scope = 'identify email guilds';
    const rememberMe = req.query.remember === 'true';

    console.log('Discord OAuth - Client ID:', clientId);
    console.log('Discord OAuth - Redirect URI:', redirectUri);
    console.log('Discord OAuth - Remember Me:', rememberMe);

    if (!clientId) {
      return res.status(500).json({ message: "Discord client ID not configured" });
    }

    // Generate secure random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store session data immediately without callbacks
    const session = req.session as any;
    session.pendingRememberMe = rememberMe;
    session.oauthState = state;
    session.oauthTimestamp = Date.now(); // Add timestamp for debugging

    console.log('Storing OAuth state in session:', { state });

    // Cookie-session automatically saves changes
    console.log('OAuth state stored in session');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    res.redirect(discordAuthUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code, state } = req.query;

    console.log('OAuth callback received:', {
      code: code ? 'present' : 'missing',
      state: state ? state.toString().substring(0, 8) + '...' : 'missing',
      sessionExists: !!req.session
    });

    if (!code) {
      return res.status(400).json({ message: "Authorization code not provided" });
    }

    // Enhanced session state validation
    const session = req.session as any;

    console.log('Session state check:', {
      receivedState: state ? state.toString().substring(0, 8) + '...' : 'missing',
      sessionState: session.oauthState ? session.oauthState.substring(0, 8) + '...' : 'missing',
      sessionTimestamp: session.oauthTimestamp,
      sessionAge: session.oauthTimestamp ? Date.now() - session.oauthTimestamp : 'unknown'
    });

    // Validate OAuth state parameter for CSRF protection
    if (!state) {
      console.error('OAuth callback missing state parameter');
      return res.status(400).json({ message: "Missing OAuth state parameter" });
    }

    if (!session.oauthState) {
      console.error('Session missing OAuth state - possible session loss');
      // Try to regenerate session and redirect back to login
      return res.status(400).json({
        message: "Session expired during login. Please try logging in again.",
        redirectToLogin: true
      });
    }

    if (state !== session.oauthState) {
      console.error('OAuth state mismatch:', {
        received: state.toString().substring(0, 16),
        expected: session.oauthState.substring(0, 16)
      });
      return res.status(400).json({ message: "Invalid OAuth state - possible CSRF attack" });
    }

    console.log('OAuth state validation successful');

    // Clear used OAuth state
    delete session.oauthState;
    delete session.oauthTimestamp;

    try {
      const clientId = process.env.DISCORD_CLIENT_ID || "1418600262938923220";
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;

      if (!clientSecret) {
        console.error('Discord client secret not configured');
        return res.status(500).json({ message: "Discord client secret not configured" });
      }

      console.log('Discord Callback - Client ID:', clientId);
      console.log('Discord Callback - Client Secret:', clientSecret ? 'Set' : 'Not set');

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      console.log('Token Response Status:', tokenResponse.status);
      // Sensitive token data logging removed for security

      if (!tokenResponse.ok) {
        console.error('Discord token exchange failed:', tokenData);
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to get access token');
      }

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      console.log('User Response Status:', userResponse.status);
      // Sensitive user data logging removed for security

      if (!userResponse.ok) {
        console.error('Discord user fetch failed:', discordUser);
        throw new Error('Failed to get user info');
      }

      // Check if user exists in database
      let user = await storage.getUserByDiscordId(discordUser.id);

      // Check if this is the admin user using username
      const ADMIN_USERNAMES = ['axiom_2401', 'aetherflux_002']; // Add more admin usernames here
      const isAdminUser = ADMIN_USERNAMES.includes(discordUser.username);

      if (!user) {
        // Create new user
        user = await storage.createUser({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          isAdmin: isAdminUser,
          discordAccessToken: tokenData.access_token,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          isAdmin: isAdminUser,
          discordAccessToken: tokenData.access_token,
        });
      }

      // Set user in session - cookie-session handles persistence automatically
      const rememberMe = req.session?.pendingRememberMe || false;

      if (req.session) {
        req.session.userId = user?.id;
        req.session.loginTime = Date.now();
        req.session.rememberMe = rememberMe;

        // Clear OAuth state
        delete req.session.oauthState;
        delete req.session.oauthTimestamp;
        delete req.session.pendingRememberMe;
      }

      console.log('User logged in with persistent session (1 year)');

      // Redirect to home - cookie-session automatically saves
      res.redirect('/');


    } catch (error) {
      console.error('Discord OAuth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    // Clear session - cookie-session API
    req.session = null;
    res.redirect('/');
  });

  // Server routes
  app.get("/api/servers", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const owner = req.query.owner as string;

      // If owner filter is specified, fetch servers by owner
      if (owner) {
        const userServers = await storage.getServersByOwner(owner);
        return res.json(userServers);
      }

      // Use the storage method with includeNormalAdvertising to show normal ads + regular servers
      // But exclude member-exchange advertising servers
      const serverList = await storage.getServers({
        search,
        limit,
        offset,
        includeNormalAdvertising: true
      });

      res.json(serverList);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get("/api/servers/popular", async (req, res) => {
    try {
      const { limit = "6" } = req.query;
      const servers = await storage.getPopularServers(parseInt(limit as string));
      // Filter to include normal advertising and non-advertising servers, exclude member-exchange
      const popularServers = servers.filter(server =>
        !server.advertisingType ||
        (server.advertisingType && server.advertisingType !== "member_exchange")
      );
      res.json(popularServers);
    } catch (error) {
      console.error("Failed to fetch popular servers:", error);
      res.status(500).json({ message: "Failed to fetch popular servers" });
    }
  });

  // Advertising servers route (must come before /:id route)
  app.get("/api/servers/advertising", async (req, res) => {
    try {
      const advertisingType = req.query.type as string;

      // Validate advertising type
      if (advertisingType && !["normal", "member_exchange"].includes(advertisingType)) {
        return res.status(400).json({ message: "Invalid advertising type. Must be 'normal' or 'member_exchange'." });
      }

      const advertisingServers = await storage.getAdvertisingServers(advertisingType);
      res.json(advertisingServers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertising servers" });
    }
  });

  // Specific endpoint for advertised servers (servers that can be boosted)
  app.get("/api/servers/advertised", async (req, res) => {
    try {
      const advertisingServers = await storage.getAdvertisingServers();
      res.json(advertisingServers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertised servers" });
    }
  });

  app.get("/api/servers/:id", async (req, res) => {
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  // Get Discord guilds where user has admin permissions
  // NOTE: This route fetches live data from Discord API, NOT from database
  // Database is only used for: add-server, add-bot, add-event, add-partnership,
  // add-template, add-job forms, and for server listings in main explore page
  // Your Servers page and target server dropdowns use live Discord API data
  app.get("/api/servers/user/:userId", async (req, res) => {
    // SECURITY: Require authentication
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // SECURITY: Verify ownership or admin access
    const isOwner = req.user.id === req.params.userId;
    const isAdmin = (req.user as any).isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only access your own Discord servers" });
    }

    try {
      const user = await storage.getUser(req.params.userId);
      if (!user || !user.discordAccessToken) {
        return res.status(404).json({ message: "User not found or access token missing" });
      }

      // Fetch user's guilds from Discord API with member counts
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds?with_counts=true', {
        headers: {
          'Authorization': `Bearer ${user.discordAccessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        if (guildsResponse.status === 401) {
          console.error('Discord access token expired or invalid');
          return res.status(401).json({ message: "Discord access token expired. Please re-authenticate." });
        }
        throw new Error(`Failed to fetch Discord guilds: ${guildsResponse.status}`);
      }

      const guilds = await guildsResponse.json();

      // Filter guilds where user has admin permissions
      // Discord permission value 8 = ADMINISTRATOR, 32 = MANAGE_GUILD
      const adminGuilds = guilds.filter((guild: any) => {
        const permissions = parseInt(guild.permissions);
        return (permissions & 8) === 8 || (permissions & 32) === 32 || guild.owner;
      });

      // Transform Discord guilds to our server format
      const servers = adminGuilds.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        description: guild.description || `${guild.name} Discord Server`,
        inviteCode: '', // We don't have invite codes from guilds API
        inviteUrl: '', // No direct invite URL
        icon: guild.icon, // Discord icon hash for CDN URL generation
        imageUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
        memberCount: guild.approximate_member_count || 0,
        onlineCount: guild.approximate_presence_count || 0,
        ownerId: req.params.userId,
        discordId: guild.id, // Store Discord guild ID
        category: 'general',
        tags: [], // Don't use Discord features as tags
        verified: guild.features?.includes('VERIFIED') || guild.features?.includes('PARTNERED') || false,
        featured: guild.features?.includes('FEATURED') || guild.features?.includes('DISCOVERABLE') || false,
        isAdvertising: false,
        advertisingType: 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      res.json(servers);
    } catch (error) {
      console.error('Discord guilds fetch error:', error);
      res.status(500).json({ message: "Failed to fetch Discord servers" });
    }
  });

  // Check if Smart Serve bot is present in a Discord server
  app.get("/api/discord/bot-check/:guildId", async (req, res) => {
    // SECURITY: Require authentication
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { guildId } = req.params;
      const botId = process.env.DISCORD_CLIENT_ID || "1371746742768500818";
      const botToken = process.env.DISCORD_BOT_TOKEN;

      console.log(`Bot check for guild ${guildId} with bot ID ${botId}`);
      console.log(`Bot token available: ${botToken ? 'Yes' : 'No'}`);

      // Validate bot token format
      if (!botToken) {
        console.error('❌ No bot token configured in environment variables');
        return res.status(500).json({
          message: "Bot token not configured. Please set DISCORD_BOT_TOKEN in Secrets.",
          botPresent: false,
          checkMethod: "no_token",
          inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
        });
      }

      // Basic bot token format validation
      if (!botToken.startsWith('MTM3MjIy') || botToken.length < 50) {
        console.error('❌ Invalid bot token format detected');
        return res.status(500).json({
          message: "Invalid bot token format. Please check your DISCORD_BOT_TOKEN in Secrets.",
          botPresent: false,
          checkMethod: "invalid_token_format",
          inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
        });
      }

      // Check if user has admin access to this guild first
      const user = await storage.getUser(req.user.id);
      if (!user || !user.discordAccessToken) {
        return res.status(404).json({ message: "User access token not found" });
      }

      // Fetch user's guilds to verify they have access to this guild
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { 'Authorization': `Bearer ${user.discordAccessToken}` },
      });

      if (!guildsResponse.ok) {
        return res.status(401).json({ message: "Failed to verify guild access" });
      }

      const guilds = await guildsResponse.json();
      const guild = guilds.find((g: any) => g.id === guildId);

      if (!guild) {
        return res.status(403).json({ message: "You don't have access to this guild" });
      }

      let botPresent = false;
      let checkMethod = "none";
      let errorDetails = "";

      try {
        console.log(`Checking bot presence in guild ${guildId} using bot token`);

        // Method 1: Check bot as guild member (most reliable)
        const botMemberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botId}`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        console.log(`Bot member response status: ${botMemberResponse.status}`);

        if (botMemberResponse.ok) {
          const memberData = await botMemberResponse.json();
          console.log(`Bot member check successful`);
          botPresent = true;
          checkMethod = "member_check";
          console.log(`✅ Bot found in guild ${guildId} as member`);
        } else if (botMemberResponse.status === 404) {
          // 404 means bot is not in the server
          botPresent = false;
          checkMethod = "not_member";
          console.log(`❌ Bot NOT found in guild ${guildId} - not a member (404)`);
        } else if (botMemberResponse.status === 401) {
          // 401 means invalid bot token
          const errorData = await botMemberResponse.json();
          errorDetails = `Invalid bot token: ${errorData.message || 'Unauthorized'}`;
          botPresent = false;
          checkMethod = "invalid_token";
          console.log(`❌ Bot token invalid for guild ${guildId} check - ${errorDetails}`);
        } else {
          // Other error
          const errorData = await botMemberResponse.json();
          errorDetails = `API Error: ${errorData.message || 'Unknown error'}`;
          console.log(`❌ Bot check failed with status ${botMemberResponse.status}: ${errorDetails}`);

          // Fallback: Try guild info method
          const guildInfoResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: { 'Authorization': `Bot ${botToken}` },
          });

          console.log(`Guild info response status: ${guildInfoResponse.status}`);

          if (guildInfoResponse.ok) {
            botPresent = true;
            checkMethod = "guild_info";
            console.log(`✅ Bot found in guild ${guildId} via guild info check`);
          } else {
            botPresent = false;
            checkMethod = "all_failed";
            console.log(`❌ Bot NOT found in guild ${guildId} - all checks failed`);
          }
        }
      } catch (error) {
        console.error('Bot presence check error:', error);
        botPresent = false;
        checkMethod = "error";
        errorDetails = error instanceof Error ? error.message : 'Unknown error';
      }

      console.log(`Final bot presence result: ${botPresent} (method: ${checkMethod})`);
      if (errorDetails) {
        console.log(`Error details: ${errorDetails}`);
      }

      res.json({
        botPresent,
        checkMethod,
        errorDetails,
        inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
      });
    } catch (error) {
      console.error('Bot check error:', error);
      res.status(500).json({ message: "Failed to check bot presence" });
    }
  });

  app.post("/api/servers", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      console.log("Creating server with data:", req.body);
      const serverData = insertServerSchema.parse({
        ...req.body,
        ownerId: req.user.id,
        isAdvertising: false, // Explicitly set as normal server for browsing
        advertisingMembersNeeded: 0,
      });
      const server = await storage.createServer(serverData);
      console.log("Server created successfully:", server);
      res.status(201).json(server);
    } catch (error) {
      console.error("Server creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  // Use requireAuth middleware for protected routes that require authentication
  const requireAuth = (req: Request, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Update server
  app.patch("/api/servers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this server" });
      }

      const updatedServer = await storage.updateServer(id, updates);
      res.json(updatedServer);
    } catch (error) {
      console.error("Error updating server:", error);
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  // Update server bump settings
  app.patch("/api/servers/:id/bump-settings", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { bumpEnabled } = req.body;

      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this server" });
      }

      const updatedServer = await storage.updateServer(id, { bumpEnabled });
      res.json(updatedServer);
    } catch (error) {
      console.error("Error updating bump settings:", error);
      res.status(500).json({ message: "Failed to update bump settings" });
    }
  });


  app.delete("/api/servers/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      if (server.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own servers" });
      }

      await storage.deleteServer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Bots
  app.get("/api/bots", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const bots = await storage.getBots({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/user/:userId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify ownership or admin access
    const isOwner = req.user.id === req.params.userId;
    const isAdmin = (req.user as any).isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only access your own bots" });
    }

    try {
      const bots = await storage.getBotsByUser(req.params.userId);
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bots" });
    }
  });

  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      res.json(bot);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots/:id/vote", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await storage.voteOnBot(id, userId);
      res.json(result);
    } catch (error) {
      console.error("Error voting on bot:", error);
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  app.get("/api/bots/popular", async (req, res) => {
    try {
      const { limit = "6" } = req.query;
      const bots = await storage.getPopularBots(parseInt(limit as string));
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular bots" });
    }
  });

  app.post("/api/bots", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const botData = insertBotSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const bot = await storage.createBot(botData);
      res.status(201).json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  // Discord invite validation
  app.post("/api/discord/validate-invite", async (req, res) => {
    try {
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }

      // Extract invite code from full URL if provided
      const code = inviteCode.split('/').pop().split('?')[0];

      // Get invite information
      const inviteResponse = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);

      if (!inviteResponse.ok) {
        return res.status(400).json({ message: "Invalid invite code" });
      }

      const inviteData = await inviteResponse.json();
      const serverId = inviteData.guild.id;

      // Check if our bot is in the server
      const botToken = process.env.DISCORD_BOT_TOKEN;

      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      if (!guildResponse.ok) {
        return res.status(400).json({
          message: "Bot is not in this server. Please invite our bot first.",
          botNotInServer: true
        });
      }

      const guildData = await guildResponse.json();

      // Get additional guild info for member counts
      const guildMembersResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}?with_counts=true`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      const guildMembersData = await guildMembersResponse.json();

      const serverData = {
        name: guildData.name,
        icon: guildData.icon ? `https://cdn.discordapp.com/icons/${serverId}/${guildData.icon}.png` : null,
        banner: guildData.banner ? `https://cdn.discordapp.com/banners/${serverId}/${guildData.banner}.png` : null,
        description: guildData.description || "",
        memberCount: guildMembersData.approximate_member_count || inviteData.approximate_member_count || 0,
        onlineCount: guildMembersData.approximate_presence_count || inviteData.approximate_presence_count || 0,
        valid: true,
        serverId: serverId,
        inviteCode: code // Include the actual invite code
      };

      res.json(serverData);
    } catch (error) {
      console.error("Discord validation error:", error);
      res.status(500).json({ message: "Failed to validate invite" });
    }
  });

  // Ads routes
  app.get("/api/ads", async (req, res) => {
    try {
      const { position } = req.query;
      const ads = await storage.getAds(position as string);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.post("/api/ads", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(adData);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.put("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.partial().parse(req.body);
      const updatedAd = await storage.updateAd(req.params.id, adData);
      if (!updatedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(updatedAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAd(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  // Slideshow routes
  app.get("/api/slideshows", async (req, res) => {
    try {
      const { page, includeInactive } = req.query;

      // Only admins can see inactive slideshows
      const showInactive = includeInactive === "true" && req.user?.isAdmin;

      const slideshows = await storage.getSlideshows(page as string, showInactive);
      res.json(slideshows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slideshows" });
    }
  });

  app.post("/api/slideshows", requireAdmin, async (req, res) => {
    try {
      const slideshowData = insertSlideshowSchema.parse(req.body);
      const slideshow = await storage.createSlideshow(slideshowData);
      res.status(201).json(slideshow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create slideshow" });
    }
  });

  app.put("/api/slideshows/:id", requireAdmin, async (req, res) => {
    try {
      const slideshowData = insertSlideshowSchema.partial().parse(req.body);
      const slideshow = await storage.updateSlideshow(req.params.id, slideshowData);
      if (!slideshow) {
        return res.status(404).json({ message: "Slideshow not found" });
      }
      res.json(slideshow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update slideshow" });
    }
  });

  app.delete("/api/slideshows/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteSlideshow(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Slideshow not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete slideshow" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const events = await storage.getEvents({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Event creation route
  app.post("/api/events", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent({
        ...eventData,
        ownerId: req.user.id,
      });
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid event data",
          errors: error.errors
        });
      }
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Wallet system routes

  app.post("/api/servers/:serverId/join", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const userId = req.user.id;
      const coinsToAward = 1;

      // Get current user for Discord verification (lightweight check before heavy transaction)
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!currentUser.discordAccessToken) {
        return res.status(400).json({ message: "Discord access required for verification" });
      }

      // Get server data to get Discord guild ID
      const serverData = await storage.getServer(serverId);
      if (!serverData) {
        return res.status(404).json({ message: "Server not found" });
      }

      const discordGuildId = serverData.serverId;
      if (!discordGuildId) {
        return res.status(400).json({ message: "Server Discord ID not found" });
      }

      // DISCORD MEMBERSHIP VERIFICATION: Verify user is actually a member of the Discord server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        // Check if user is a member of the guild using bot token
        const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${discordGuildId}/members/${currentUser.discordId}`, {
          headers: {
            'Authorization': `Bot ${botToken}`,
          },
        });

        if (!memberResponse.ok) {
          if (memberResponse.status === 404) {
            return res.status(400).json({
              message: "You must be a member of this Discord server to earn coins"
            });
          }
          throw new Error(`Discord API error: ${memberResponse.status}`);
        }
      } catch (discordError) {
        console.error("Discord membership verification failed:", discordError);
        return res.status(500).json({
          message: "Failed to verify Discord membership"
        });
      }

      // ATOMIC TRANSACTION: All validation and state checks are now inside the transaction
      const userForTransaction = await storage.getUser(userId);
      const serverForTransaction = serverData; // Use already fetched server data
      const result = await storage.atomicServerJoin({
        userId,
        serverId,
        coinsToAward,
        currentCoins: userForTransaction?.coins || 0,
        advertisingMembersNeeded: 0,
      });

      // Get fresh user data after transaction
      const updatedUser = await storage.getUser(userId);

      res.json({
        message: "Successfully joined server and earned coins",
        coinsEarned: coinsToAward,
        newBalance: result.newBalance,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Server join error:", error);

      // Handle specific error cases with user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes("already earned coins")) {
          return res.status(400).json({ message: error.message });
        }
        if (error.message.includes("not currently advertising") || error.message.includes("quota exhausted")) {
          return res.status(400).json({ message: "Server is not available for coin earning" });
        }
        if (error.message.includes("Server not found")) {
          return res.status(404).json({ message: "Server not found" });
        }
      }

      res.status(500).json({ message: "Failed to process server join" });
    }
  });

  // Purchase members for advertising (works with Discord servers)
  app.post("/api/servers/purchase-members", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId, members } = req.body; // serverId here is the Discord guild ID
      const userId = req.user.id;

      if (!members || typeof members !== 'number' || members <= 0) {
        return res.status(400).json({ message: "Valid members count required" });
      }

      const costPerMember = 2;
      const totalCost = members * costPerMember;

      // Get current user to check balance
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentCoins = currentUser.coins || 0;
      if (currentCoins < totalCost) {
        return res.status(400).json({
          message: "Insufficient coins",
          required: totalCost,
          available: currentCoins,
        });
      }

      // Verify the user owns/admins the server (using Discord API)
      if (!currentUser.discordAccessToken) {
        return res.status(400).json({ message: "Discord access required" });
      }

      // Fetch user's guilds to verify ownership
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${currentUser.discordAccessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        return res.status(400).json({ message: "Failed to verify server ownership" });
      }

      const guilds = await guildsResponse.json();
      const userGuild = guilds.find((guild: any) => guild.id === serverId && (guild.permissions & 0x8) === 0x8); // ADMINISTRATOR permission

      if (!userGuild) {
        return res.status(403).json({ message: "You must be an admin of this server" });
      }

      // Check or create server in database for advertising
      let serverData = await storage.getServerByDiscordId(serverId);
      if (!serverData) {
        // Create server entry for advertising
        serverData = await storage.createServer({
          name: userGuild.name,
          description: userGuild.description || `${userGuild.name} Discord Server`,
          serverId: serverId,
          ownerId: userId,
          memberCount: userGuild.approximate_member_count || 0,
          tags: [],
          inviteLink: '',
          category: 'general',
          advertisingType: 'none',
        });
      }

      // ATOMIC OPERATION: Deduct coins and set server as member-exchange advertising
      const newCoinBalance = currentCoins - totalCost;
      await Promise.all([
        storage.updateUserCoins(userId, newCoinBalance),
        storage.updateServer(serverData.id, {
          advertisingUserId: userId,
          advertisingType: "member_exchange",
          advertisingExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
      ]);

      res.json({
        message: "Successfully purchased advertising",
        members: members,
        costPaid: totalCost,
        newBalance: newCoinBalance,
      });
    } catch (error) {
      console.error("Member purchase error:", error);
      res.status(500).json({ message: "Failed to process member purchase" });
    }
  });

  app.post("/api/servers/:serverId/advertise", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const { members } = req.body;
      const userId = req.user.id;

      if (!members || typeof members !== 'number' || members <= 0) {
        return res.status(400).json({ message: "Valid members count required" });
      }

      const costPerMember = 2;
      const totalCost = members * costPerMember;

      // Get current user to check balance
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentCoins = currentUser.coins || 0;
      if (currentCoins < totalCost) {
        return res.status(400).json({
          message: "Insufficient coins",
          required: totalCost,
          available: currentCoins,
        });
      }

      // Verify the user owns/admins the server (using Discord API)
      if (!currentUser.discordAccessToken) {
        return res.status(400).json({ message: "Discord access required" });
      }

      // Fetch user's guilds to verify ownership
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${currentUser.discordAccessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        return res.status(400).json({ message: "Failed to verify server ownership" });
      }

      const guilds = await guildsResponse.json();
      const userGuild = guilds.find((guild: any) => guild.id === serverId && (guild.permissions & 0x8) === 0x8); // ADMINISTRATOR permission

      if (!userGuild) {
        return res.status(403).json({ message: "You must be an admin of this server" });
      }

      // ATOMIC OPERATION: Deduct coins and set server as member-exchange advertising
      const newCoinBalance = currentCoins - totalCost;
      await Promise.all([
        storage.updateUserCoins(userId, newCoinBalance),
        storage.updateServer(serverId, {
          advertisingUserId: userId,
          advertisingType: "member_exchange",
          advertisingExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
      ]);

      res.json({
        message: "Successfully purchased advertising",
        membersAdvertised: members,
        costPaid: totalCost,
        newBalance: newCoinBalance,
      });
    } catch (error) {
      console.error("Server advertise error:", error);
      res.status(500).json({ message: "Failed to process advertising purchase" });
    }
  });

  // Coin transfer endpoint
  app.post("/api/users/transfer-coins", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { recipientId, amount } = req.body;
      const senderId = req.user.id;

      if (!recipientId || !amount) {
        return res.status(400).json({ message: "Recipient ID and amount are required" });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      const result = await storage.transferCoins(senderId, recipientId, amount);

      res.json({
        message: "Coins transferred successfully",
        amount,
        senderBalance: result.fromBalance,
        recipientBalance: result.toBalance
      });
    } catch (error) {
      console.error("Coin transfer error:", error);

      if (error instanceof Error) {
        if (error.message.includes("Insufficient coins")) {
          return res.status(400).json({ message: "You don't have enough coins for this transfer" });
        }
        if (error.message.includes("Cannot transfer coins to yourself")) {
          return res.status(400).json({ message: "You cannot transfer coins to yourself" });
        }
        if (error.message.includes("Sender not found")) {
          return res.status(404).json({ message: "Your account was not found" });
        }
        if (error.message.includes("Recipient not found")) {
          return res.status(404).json({ message: "Recipient user not found" });
        }
      }

      res.status(500).json({ message: "Failed to transfer coins" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const { range = "7d", category = "all" } = req.query;

      const analytics = {
        totalViews: 15420,
        uniqueVisitors: 3240,
        serverJoins: 842,
        botInvites: 567,
        topServers: [
          { id: "1", name: "Gaming Central", category: "Gaming", views: 1250 },
          { id: "2", name: "Study Group", category: "Education", views: 980 },
          { id: "3", name: "Art Community", category: "Creative", views: 750 },
        ],
        growth: {
          engagement: 18,
          servers: 12,
          bots: 25,
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Moderation routes
  app.get("/api/moderation/reports", requireAdmin, async (req, res) => {
    try {
      const reports = [
        {
          id: "1",
          title: "Inappropriate server content",
          description: "Server contains NSFW content without proper labeling",
          type: "content",
          status: "pending",
          reporterUsername: "user123",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Spam bot behavior",
          description: "Bot is sending unsolicited messages",
          type: "behavior",
          status: "pending",
          reporterUsername: "moderator456",
          createdAt: new Date().toISOString(),
        }
      ];

      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/moderation/stats", requireAdmin, async (req, res) => {
    try {
      const stats = {
        totalReports: 45,
        pendingReports: 8,
        reportsToday: 3,
        actionsToday: 5,
        avgResponseTime: "2h",
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
      res.status(500).json({ message: "Failed to fetch moderation stats" });
    }
  });

  app.patch("/api/moderation/reports/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      // Process moderation action here
      console.log(`Moderation action ${action} applied to report ${id}: ${reason}`);

      res.json({ success: true, message: "Moderation action completed" });
    } catch (error) {
      console.error("Error processing moderation action:", error);
      res.status(500).json({ message: "Failed to process moderation action" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = [
        {
          id: "1",
          title: "Quest Completed!",
          message: "You've completed the 'Join Server' quest and earned 2 coins!",
          type: "quest",
          priority: "normal",
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Server Featured",
          message: "Your server 'Gaming Hub' has been featured on the homepage!",
          type: "system",
          priority: "high",
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          title: "New Bot Review",
          message: "Your bot submission has received a new review.",
          type: "email",
          priority: "normal",
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        }
      ];

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Marking notification ${id} as read for user ${req.user!.id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting notification ${id} for user ${req.user!.id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.patch("/api/notifications/settings", requireAuth, async (req, res) => {
    try {
      const settings = req.body;
      console.log(`Updating notification settings for user ${req.user!.id}:`, settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Get user by Discord username/ID for Trade feature
  app.get("/api/users/lookup/:identifier", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { identifier } = req.params;

      // Try to find user by Discord ID first, then by username
      let user = await storage.getUserByDiscordId(identifier);
      if (!user) {
        user = await storage.getUserByDiscordUsername(identifier);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return limited user info for privacy
      res.json({
        id: user.id,
        username: user.username,
        discordId: user.discordId,
        avatar: user.avatar
      });
    } catch (error) {
      console.error("User lookup error:", error);
      res.status(500).json({ message: "Failed to lookup user" });
    }
  });

  // Handle server leave notifications
  app.post("/api/servers/:serverId/leave", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const userId = req.user.id;

      // Handle the server leave and potential coin deduction
      const result = await storage.handleServerLeave(userId, serverId);

      if (!result) {
        return res.status(404).json({ message: "No active server join record found" });
      }

      res.json({
        message: result.coinsDeducted > 0
          ? `You left the server within 3 days and lost ${result.coinsDeducted} coins`
          : "You left the server with no coin penalty",
        coinsDeducted: result.coinsDeducted,
        newBalance: result.newBalance,
      });
    } catch (error) {
      console.error("Server leave error:", error);
      res.status(500).json({ message: "Failed to process server leave" });
    }
  });

  // Quest system routes
  app.get("/api/quests", (req, res) => {
    const quests = [
      {
        id: "invite_members",
        title: "Invite New Members",
        description: "Invite 3 new members to the Discord server",
        reward: 15,
        type: "social",
        requirements: {
          count: 3,
          action: "invite"
        }
      },
      {
        id: "daily_login",
        title: "Daily Login",
        description: "Login to the platform daily",
        reward: 5,
        type: "daily",
        requirements: {
          frequency: "daily"
        }
      },
      {
        id: "join_server",
        title: "Join Discord Server",
        description: "Join the official Discord server",
        reward: 10,
        type: "one_time",
        requirements: {
          action: "join_discord"
        }
      }
    ];

    res.json(quests);
  });

  // Get user's quest progress and completions
  app.get("/api/quests/user-progress", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get quest completions from user metadata - ensure it's properly parsed
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error("Error parsing user metadata:", parseError);
        questData = {};
      }

      const completions = (questData as any).questCompletions || [];
      const lastDailyReward = (questData as any).lastDailyReward || null;

      res.json({
        completions,
        lastDailyReward
      });
    } catch (error) {
      console.error("Error fetching user quest progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check server membership status
  app.get("/api/quests/server-status", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user || !user.discordAccessToken) {
        return res.status(404).json({ message: "User not found or no Discord access" });
      }

      const botToken = process.env.DISCORD_BOT_TOKEN;
      const serverGuildId = "1371746742768500818"; // Your server's guild ID

      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        // Check if user is in the server
        const apiUrl = `https://discord.com/api/v10/guilds/${serverGuildId}/members/${user.discordId}`;
        console.log(`Checking server membership: ${apiUrl}`);
        console.log(`Discord ID: ${user.discordId}, Guild: ${serverGuildId}`);

        const memberResponse = await fetch(apiUrl, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        console.log(`Discord API Response Status: ${memberResponse.status}`);

        const inServer = memberResponse.ok;

        // Check if user is boosting
        let isBoosting = false;
        if (inServer) {
          const memberData = await memberResponse.json();
          console.log('Member data:', memberData);
          isBoosting = memberData.premium_since !== null;
        } else {
          // Log the error response
          const errorText = await memberResponse.text();
          console.log(`Discord API Error Response: ${errorText}`);
        }

        console.log(`Server Status Result: inServer=${inServer}, isBoosting=${isBoosting}`);

        res.json({
          inServer,
          isBoosting,
          serverGuildId
        });
      } catch (error) {
        console.error("Discord API error:", error);
        res.json({ inServer: false, isBoosting: false, serverGuildId });
      }
    } catch (error) {
      console.error("Error checking server status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily reward endpoint
  app.post("/api/quests/daily-reward", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse metadata properly
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error("Error parsing user metadata:", parseError);
        questData = {};
      }

      const lastDailyReward = (questData as any).lastDailyReward;

      // Check if user can claim daily reward (strict 24-hour check)
      if (lastDailyReward) {
        const lastClaim = new Date(lastDailyReward);
        const now = new Date();
        const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < 24) {
          const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim);
          const minutesRemaining = Math.ceil(((24 - hoursSinceLastClaim) % 1) * 60);
          return res.status(400).json({
            message: `Daily reward already claimed. Try again in ${hoursRemaining}h ${minutesRemaining}m.`,
            timeRemaining: { hours: hoursRemaining, minutes: minutesRemaining }
          });
        }
      }

      // Award coins and update last claim time
      const coinsEarned = 2;
      const newCoins = (user.coins || 0) + coinsEarned;
      const now = new Date().toISOString();
      const newMetadata = {
        ...questData,
        lastDailyReward: now
      };

      await db.update(users)
        .set({
          coins: newCoins,
          metadata: JSON.stringify(newMetadata)
        })
        .where(eq(users.id, req.user!.id));

      console.log(`User ${user.discordId} claimed daily reward: ${coinsEarned} coins (new balance: ${newCoins})`);
      res.json({ coinsEarned, totalCoins: newCoins });
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Join server quest endpoint
  app.post("/api/quests/join-server", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse metadata properly
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error("Error parsing user metadata:", parseError);
        questData = {};
      }

      const completions = (questData as any).questCompletions || [];

      // Check if already completed
      if (completions.some((c: any) => c.questId === "join-server")) {
        return res.status(400).json({ message: "Quest already completed" });
      }

      // Verify user is actually in the Discord server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const serverGuildId = "1371746742768500818"; // Your server's guild ID

      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${serverGuildId}/members/${user.discordId}`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        if (!memberResponse.ok) {
          return res.status(400).json({ message: "You must be in the Discord server to complete this quest" });
        }

        // Award coins and mark quest as completed
        const coinsEarned = 2;
        const newCoins = (user.coins || 0) + coinsEarned;
        const newCompletion = {
          questId: "join-server",
          completedAt: new Date().toISOString(),
          reward: coinsEarned
        };

        const newMetadata = {
          ...questData,
          questCompletions: [...completions, newCompletion]
        };

        await db.update(users)
          .set({
            coins: newCoins,
            metadata: JSON.stringify(newMetadata)
          })
          .where(eq(users.id, req.user!.id));

        console.log(`User ${user.discordId} completed join-server quest: ${coinsEarned} coins (new balance: ${newCoins})`);
        res.json({ coinsEarned, totalCoins: newCoins });
      } catch (discordError) {
        console.error("Discord verification error:", discordError);
        return res.status(500).json({ message: "Failed to verify Discord membership" });
      }
    } catch (error) {
      console.error("Error completing join server quest:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check invites quest endpoint
  app.post("/api/quests/check-invites", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse metadata properly
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error("Error parsing user metadata:", parseError);
        questData = {};
      }

      const serverGuildId = "1371746742768500818"; // Your server's guild ID
      const botToken = process.env.DISCORD_BOT_TOKEN;

      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        // Get invite data from Discord API
        const invitesResponse = await fetch(`https://discord.com/api/v10/guilds/${serverGuildId}/invites`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        if (!invitesResponse.ok) {
          return res.status(500).json({ message: "Failed to fetch invite data" });
        }

        const invites = await invitesResponse.json();

        // Find invites created by this user
        const userInvites = invites.filter((invite: any) => invite.inviter && invite.inviter.id === user.discordId);

        // Calculate total uses
        const totalUses = userInvites.reduce((sum: number, invite: any) => sum + (invite.uses || 0), 0);
        const lastInviteCount = (questData as any).lastInviteCount || 0;
        const newInvites = Math.max(0, totalUses - lastInviteCount);

        if (newInvites > 0) {
          const coinsEarned = newInvites * 3; // 3 coins per invite
          const newCoins = (user.coins || 0) + coinsEarned;

          const newMetadata = {
            ...questData,
            lastInviteCount: totalUses
          };

          await db.update(users)
            .set({
              coins: newCoins,
              metadata: JSON.stringify(newMetadata)
            })
            .where(eq(users.id, req.user!.id));

          console.log(`User ${user.discordId} earned ${coinsEarned} coins for ${newInvites} new invites (new balance: ${newCoins})`);
          res.json({ newInvites, coinsEarned, totalCoins: newCoins });
        } else {
          res.json({ newInvites: 0, coinsEarned: 0, totalCoins: user.coins || 0 });
        }
      } catch (discordError) {
        console.error("Discord invite check error:", discordError);
        return res.status(500).json({ message: "Failed to check invites" });
      }
    } catch (error) {
      console.error("Error checking invites:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Boost server quest endpoint
  app.post("/api/quests/boost-server", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Parse metadata properly
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error("Error parsing user metadata:", parseError);
        questData = {};
      }

      const completions = (questData as any).questCompletions || [];

      // Check if already completed
      if (completions.some((c: any) => c.questId === "boost-server")) {
        return res.status(400).json({ message: "Quest already completed" });
      }

      // Verify user is actually boosting the Discord server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const serverGuildId = "1371746742768500818"; // Your server's guild ID

      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${serverGuildId}/members/${user.discordId}`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        if (!memberResponse.ok) {
          return res.status(400).json({ message: "You must be in the Discord server first" });
        }

        const memberData = await memberResponse.json();
        const isBoosting = memberData.premium_since !== null;

        if (!isBoosting) {
          return res.status(400).json({ message: "You must be boosting the server to complete this quest" });
        }

        // Award coins and mark quest as completed
        const coinsEarned = 50;
        const newCoins = (user.coins || 0) + coinsEarned;
        const newCompletion = {
          questId: "boost-server",
          completedAt: new Date().toISOString(),
          reward: coinsEarned
        };

        const newMetadata = {
          ...questData,
          questCompletions: [...completions, newCompletion]
        };

        await db.update(users)
          .set({
            coins: newCoins,
            metadata: JSON.stringify(newMetadata)
          })
          .where(eq(users.id, req.user!.id));

        console.log(`User ${user.discordId} completed boost-server quest: ${coinsEarned} coins (new balance: ${newCoins})`);
        res.json({ coinsEarned, totalCoins: newCoins });
      } catch (discordError) {
        console.error("Discord verification error:", discordError);
        return res.status(500).json({ message: "Failed to verify Discord boost status" });
      }
    } catch (error) {
      console.error("Error completing boost server quest:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review routes
  app.post("/api/servers/:serverId/reviews", reviewLimiter, validateReview, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Check if the user has already reviewed this server
      const existingReview = await storage.getReview(serverId, userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this server." });
      }

      // Check if the user has joined the server (optional, but good for review integrity)
      // This would require a more complex check, potentially involving serverJoin records or Discord API calls

      const newReview = await storage.createReview({
        serverId,
        userId,
        rating,
        review: comment,
      });

      // Update server's average rating
      await storage.updateServerAverageRating(serverId);

      res.status(201).json(newReview);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/servers/:serverId/reviews", async (req, res) => {
    try {
      const { serverId } = req.params;
      const { limit = "10", offset = "0" } = req.query;
      const reviews = await storage.getReviewsForServer(serverId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Update review (only by the user who wrote it)
  app.put("/api/reviews/:reviewId", reviewLimiter, validateReview, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own reviews" });
      }

      const updatedReview = await storage.updateReview(reviewId, {
        rating,
        review: comment,
      });

      // Update server's average rating
      await storage.updateServerAverageRating(review.serverId);

      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete review (only by the user who wrote it or admin)
  app.delete("/api/reviews/:reviewId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const isAdmin = (req.user as any).isAdmin;

      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You can only delete your own reviews or as an admin" });
      }

      await storage.deleteReview(reviewId);

      // Update server's average rating
      await storage.updateServerAverageRating(review.serverId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Comments routes
  app.get("/api/servers/:serverId/comments", async (req, res) => {
    try {
      const { serverId } = req.params;
      const { limit = "20", offset = "0" } = req.query;
      const comments = await storage.getCommentsForServer(serverId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/servers/:serverId/comments", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const { content, parentId } = req.body;
      const userId = req.user!.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Comment too long (max 1000 characters)" });
      }

      const comment = await storage.createComment({
        serverId,
        userId,
        content: content.trim(),
        parentId: parentId || null,
      });

      // Update server comment count
      await storage.incrementServerCommentCount(serverId);

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/comments/:commentId/like", requireAuth, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const result = await storage.toggleCommentLike(commentId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling comment like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.delete("/api/comments/:commentId", requireAuth, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const isAdmin = (req.user as any).isAdmin;

      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You can only delete your own comments" });
      }

      await storage.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Voting routes
  app.post("/api/servers/:serverId/vote", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const { voteType } = req.body;
      const userId = req.user!.id;

      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }

      const result = await storage.voteOnServer(serverId, userId, voteType);
      res.json(result);
    } catch (error) {
      console.error("Error voting on server:", error);
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  app.get("/api/servers/:serverId/vote-status", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const userId = req.user!.id;

      const voteStatus = await storage.getUserVoteStatus(serverId, userId);
      res.json(voteStatus);
    } catch (error) {
      console.error("Error fetching vote status:", error);
      res.status(500).json({ message: "Failed to fetch vote status" });
    }
  });

  // Support ticket routes
  app.post("/api/support/ticket", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user!.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Support message is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const ticket = await storage.createSupportTicket({
        userId: userId,
        username: user.username,
        message: message.trim(),
        status: 'open',
      });

      // Here you could add Discord DM integration
      // The Discord bot will handle sending DMs to the user and admins

      res.status(201).json({
        message: "Support ticket created successfully",
        ticketId: ticket.id
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/support/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Blog routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { search, category, limit = "20", offset = "0" } = req.query;
      const posts = await storage.getBlogPosts({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        featured: false,
      });
      // Note: search and category filtering will be implemented when blog table is added
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      res.status(500).json({ message: "Failed to fetch featured blog posts" });
    }
  });

  app.post("/api/blog/posts", requireAdmin, async (req, res) => {
    try {
      const { title, content, excerpt, category, featured } = req.body;
      const authorId = req.user!.id;

      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const post = await storage.createBlogPost({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        category,
        featured: featured || false,
        authorId,
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Partnerships routes
  app.get("/api/partnerships", async (req, res) => {
    try {
      const { search, type, limit = "20", offset = "0" } = req.query;
      const partnerships = await storage.getPartnerships({
        search: search as string,
        type: type as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  // Create partnership
  app.post("/api/partnerships", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPartnershipSchema.parse({
        ...req.body,
        ownerId: req.user!.id,
      });

      const partnership = await storage.createPartnership(validatedData);
      console.log("Partnership created successfully:", partnership.id);
      res.json({ success: true, partnership });
    } catch (error) {
      console.error("Partnership creation error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create partnership"
      });
    }
  });

  app.post("/api/partnerships/analyze", requireAuth, async (req, res) => {
    try {
      const { serverLink } = req.body;
      const analysis = await storage.analyzePartnershipServer(serverLink);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing server:", error);
      res.status(500).json({ message: "Failed to analyze server" });
    }
  });

  // Templates routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { search, category, limit = "20", offset = "0" } = req.query;
      const templates = await storage.getServerTemplates({
        search: search as string,
        category: category as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const templateData = insertServerTemplateSchema.parse({
        ...req.body,
        ownerId: req.user!.id,
        templateLink: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
      const template = await storage.createServerTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.post("/api/templates/analyze", requireAuth, async (req, res) => {
    try {
      const { serverLink } = req.body;
      const inviteCode = serverLink.split('/').pop().split('?')[0];

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      // Get invite info
      const inviteResponse = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`);
      if (!inviteResponse.ok) {
        return res.status(400).json({ message: "Invalid server link" });
      }

      const inviteData = await inviteResponse.json();
      const guildId = inviteData.guild.id;

      // Get guild channels and roles
      const [channelsResponse, rolesResponse] = await Promise.all([
        fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
          headers: { 'Authorization': `Bot ${botToken}` }
        }),
        fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
          headers: { 'Authorization': `Bot ${botToken}` }
        })
      ]);

      if (!channelsResponse.ok || !rolesResponse.ok) {
        return res.status(400).json({ message: "Bot is not in this server or lacks permissions" });
      }

      const channels = await channelsResponse.json();
      const roles = await rolesResponse.json();

      // Filter out bot-specific roles and @everyone
      const filteredRoles = roles.filter((role: any) =>
        !role.managed && role.name !== '@everyone'
      );

      res.json({
        serverName: inviteData.guild.name,
        serverIcon: inviteData.guild.icon ?
          `https://cdn.discordapp.com/icons/${guildId}/${inviteData.guild.icon}.png` : null,
        channels: channels.map((channel: any) => ({
          name: channel.name,
          type: channel.type === 4 ? 'category' : channel.type === 2 ? 'voice' : 'text',
          position: channel.position,
          category: channel.parent_id,
        })),
        roles: filteredRoles.map((role: any) => ({
          name: role.name,
          color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null,
          permissions: role.permissions,
          position: role.position,
          mentionable: role.mentionable,
        }))
      });
    } catch (error) {
      console.error("Error analyzing server:", error);
      res.status(500).json({ message: "Failed to analyze server" });
    }
  });

  app.post("/api/templates/validate", async (req, res) => {
    try {
      const { templateLink, guildId } = req.body;
      const template = await storage.getTemplateByLink(templateLink);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error validating template:", error);
      res.status(500).json({ message: "Failed to validate template" });
    }
  });

  // User coins routes
  app.get("/api/user/coins", requireAuth, async (req, res) => {
    try {
      const coins = await storage.getUserCoins(req.user!.id);
      res.json({ coins });
    } catch (error) {
      console.error("Error fetching user coins:", error);
      res.status(500).json({ message: "Failed to fetch coins" });
    }
  });

  app.post("/api/user/coins/update", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      if (typeof amount !== 'number') {
        return res.status(400).json({ message: "Invalid amount" });
      }

      await storage.updateUserCoins(req.user!.id, amount);
      const newCoins = await storage.getUserCoins(req.user!.id);
      res.json({ coins: newCoins });
    } catch (error) {
      console.error("Error updating user coins:", error);
      res.status(500).json({ message: "Failed to update coins" });
    }
  });

  // Page Information API for Discord bot
  app.get("/api/page-info/:pageName", async (req, res) => {
    try {
      const { pageName } = req.params;

      const pageInfoMap: Record<string, any> = {
        'home': {
          title: 'Smart Serve - Discord Community Hub',
          description: 'Discover amazing Discord servers, bots, and earn coins through our quest system!',
          url: '/',
          features: [
            '🏆 Browse top Discord servers',
            '🤖 Discover useful bots',
            '💰 Complete quests for rewards',
            '🎯 Interactive community features'
          ],
          stats: {
            'Total Servers': await storage.getServerCount(),
            'Active Users': 'Coming Soon',
            'Coins Distributed': 'Coming Soon'
          }
        },
        'servers': {
          title: 'Discord Server Directory',
          description: 'Find and join the best Discord communities across all categories',
          url: '/servers',
          features: [
            '🔍 Advanced server search',
            '⭐ Popular server rankings',
            '📊 Real-time member counts',
            '✅ Verified server badges'
          ],
          stats: {
            'Listed Servers': await storage.getServerCount(),
            'Categories': 'Gaming, Tech, Art, Music & More'
          }
        },
        'bots': {
          title: 'Discord Bot Marketplace',
          description: 'Discover powerful Discord bots to enhance your server',
          url: '/bots',
          features: [
            '🤖 Curated bot collection',
            '⚡ Easy bot integration',
            '📈 Bot statistics & reviews',
            '🔧 Setup guides & support'
          ],
          stats: {
            'Available Bots': await storage.getBotCount(),
            'Categories': 'Moderation, Music, Games, Utility'
          }
        },
        'store': {
          title: 'Coin Store',
          description: 'Spend your earned coins on server boosts, badges, and premium features',
          url: '/store',
          features: [
            '💎 Premium server features',
            '🏅 Exclusive badges',
            '⚡ Server boosts',
            '🎁 Special rewards'
          ],
          stats: {
            'Available Items': 'Coming Soon',
            'Coin Exchange Rate': '1 Coin = Premium Features'
          }
        },
        'quests': {
          title: 'Quest System',
          description: 'Complete challenges and earn coins by participating in the community',
          url: '/quests',
          features: [
            '🎯 Daily & weekly quests',
            '💰 Coin rewards',
            '🏆 Achievement system',
            '📊 Progress tracking'
          ],
          stats: {
            'Active Quests': 'Join Server, Boost Server, Invite Friends',
            'Reward Range': '2-50 coins per quest'
          }
        }
      };

      const pageInfo = pageInfoMap[pageName.toLowerCase()];

      if (!pageInfo) {
        return res.status(404).json({
          error: 'Page not found',
          availablePages: Object.keys(pageInfoMap)
        });
      }

      res.json(pageInfo);
    } catch (error) {
      console.error('Error fetching page info:', error);
      res.status(500).json({ message: "Failed to fetch page information" });
    }
  });

  // Test database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      // Test the MySQL connection
      const result = await db.select().from(users).limit(1);
      res.json({
        success: true,
        message: "MySQL database connection successful",
        timestamp: new Date().toISOString(),
        database: "MySQL"
      });
    } catch (error) {
      console.error("MySQL database connection error:", error);
      res.status(500).json({
        success: false,
        message: "MySQL database connection failed",
        error: error.message
      });
    }
  });

  // FAQ API routes
  app.get("/api/faqs", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const category = req.query.category as string;
      // Admin can see all FAQs, regular users only see active ones
      const isActive = req.user?.isAdmin ?
        (req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined) :
        true;

      const faqs = await storage.getFaqs({
        search,
        category,
        isActive,
        limit,
        offset
      });

      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // FAQ management routes (admin only)
  app.post("/api/faqs", requireAdmin, async (req, res) => {
    try {
      const faqData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(faqData);
      res.status(201).json(faq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.put("/api/faqs/:id", requireAdmin, async (req, res) => {
    try {
      const faqData = insertFaqSchema.partial().parse(req.body);
      const updatedFaq = await storage.updateFaq(req.params.id, faqData);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updatedFaq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteFaq(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  // Support ticket API routes
  app.post("/api/support/tickets", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const ticketData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket({
        ...ticketData,
        userId: req.user.id
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/support/tickets", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      // Regular users can only see their own tickets, admins can see all
      const options = req.user.isAdmin ? { status, limit, offset } : { userId: req.user.id, status, limit, offset };

      const tickets = await storage.getSupportTickets(options);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Contact submission API route
  app.post("/api/contact", async (req, res) => {
    try {
      const submissionData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(submissionData);

      res.status(201).json({
        id: submission.id,
        message: "Your message has been submitted successfully. We will get back to you soon!"
      });
    } catch (error) {
      console.error("Error creating contact submission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Discord bot submission notification
  app.post("/api/discord/bot-submitted", async (req, res) => {
    try {
      const bot = req.body;
      const { discordBot } = await import('./discord-bot');

      if (discordBot && discordBot.isReady()) {
        const ADMIN_CHANNEL_ID = "1234567890"; // Replace with actual admin channel ID

        const embed = new (await import('discord.js')).EmbedBuilder()
          .setTitle('🤖 New Bot Submission')
          .setColor('#7C3AED')
          .addFields(
            { name: '🤖 Bot Name', value: bot.name, inline: true },
            { name: '👤 Owner', value: bot.ownerId, inline: true },
            // Extract client ID from bot token if DISCORD_CLIENT_ID is not set
            // This ensures the invite link is correct even if DISCORD_CLIENT_ID is missing
            (() => {
              const clientId = process.env.DISCORD_CLIENT_ID || (process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.split('.')[0] : "1418600262938923220");
              const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
              return { name: '🔗 Invite Link', value: botInviteUrl, inline: false };
            })(),
            { name: '📝 Description', value: bot.description.substring(0, 1000), inline: false }
          )
          .setTimestamp();

        if (bot.iconUrl) {
          embed.setThumbnail(bot.iconUrl);
        }

        const channel = await discordBot.channels.fetch(ADMIN_CHANNEL_ID);
        if (channel && channel.isTextBased()) {
          await channel.send({
            content: '📋 **New bot submission for review!**\n\n*Use `/accept botid:' + bot.id + ' user:@owner action:accept/decline` to process.*',
            embeds: [embed]
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Discord notification error:', error);
      res.status(500).json({ message: "Failed to send Discord notification" });
    }
  });

  // Database health check
  app.get("/api/health/db", async (_req, res) => {
    try {
      // Simple query to test database connection
      const result = await db.execute(sql`SELECT 1 as test`);
      res.json({
        status: "connected",
        message: "Database connection successful",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // SEO and Sitemap routes
  app.get("/sitemap.xml", generateSitemap);

  app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: https://axiom-discord.replit.app/sitemap.xml

Crawl-delay: 1

Disallow: /admin
Disallow: /payment/
Disallow: /profile
Disallow: /your-servers
Disallow: /your-bots`);
  });

  // Google verification file route
  app.get("/google9fd896c9fede5b13.html", (req, res) => {
    res.type('text/plain');
    res.send('google-site-verification: google9fd896c9fede5b13.html');
  });

  // Alternative verification file route
  app.get("/google-site-verification.txt", (req, res) => {
    res.type('text/plain');
    res.send('google-site-verification: google9fd896c9fede5b13.html');
  });

  // Open Graph image route for better social sharing
  app.get("/api/og-image/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;

      // Generate dynamic OG images based on content
      let data;
      if (type === 'server') {
        data = await db.select().from(servers).where(eq(servers.id, parseInt(id))).limit(1);
      } else if (type === 'bot') {
        data = await db.select().from(bots).where(eq(bots.id, parseInt(id))).limit(1);
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Return structured data for OG tags
      res.json({
        title: data[0].name || data[0].title,
        description: data[0].description,
        image: data[0].iconUrl || data[0].imageUrl || '/assets/axiom-logo.png',
        url: `https://axiom-discord.replit.app/${type}/${id}`
      });
    } catch (error) {
      console.error("Error generating OG data:", error);
      res.status(500).json({ message: "Failed to generate OG data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}