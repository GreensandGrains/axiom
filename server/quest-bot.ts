import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
import mysql from 'mysql2/promise';
import dotenv from "dotenv";
dotenv.config();


// Database connection configuration - using same config as main app
const dbConfig = {
  host: process.env.DB_HOST || 'db2.sillydevelopment.co.uk',
  user: process.env.DB_USER || 'u77272_CezJ7ZJDoG',
  password: process.env.DB_PASSWORD || '4R.u8LGwD10VjCh84af=k4Vh',
  database: process.env.DB_NAME || 's77272_axiom',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Create Discord client for second bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Database connection pool
let db: mysql.Pool;

// Bot settings storage
const guildSettings = new Map<string, {
  questClaimChannelId?: string;
  boostChannelId?: string;
  prefix?: string;
}>();

// Quest notification commands
const commands = [
  new SlashCommandBuilder()
    .setName('setquestchannel')
    .setDescription('Set the channel for quest completion notifications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send quest notifications')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('setboostchannel')
    .setDescription('Set the channel for boost notifications')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send boost notifications')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('removequestchannel')
    .setDescription('Remove quest notification channel'),

  new SlashCommandBuilder()
    .setName('removeboostchannel')
    .setDescription('Remove boost notification channel'),

  new SlashCommandBuilder()
    .setName('questsettings')
    .setDescription('View current quest notification settings'),

  new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Set command prefix for page information commands')
    .addStringOption(option =>
      option.setName('prefix')
        .setDescription('New command prefix (e.g., "!")')
        .setRequired(true)
    ),
];

// Initialize database connection
async function initDatabase() {
  try {
    db = mysql.createPool(dbConfig);
    console.log('✅ Connected to external MySQL database');
    
    // Test connection
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
  }
}

// Register slash commands
async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT2_TOKEN!);
    
    console.log('Started refreshing quest bot application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands.map(command => command.toJSON()) },
    );

    console.log('Successfully reloaded quest bot application (/) commands.');
  } catch (error) {
    console.error('Error registering quest bot commands:', error);
  }
}

client.once('clientReady', async () => {
  console.log(`✅ Quest Bot logged in as ${client.user?.tag}!`);
  await initDatabase();
  await registerCommands();
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'setquestchannel':
        await handleSetQuestChannel(interaction);
        break;
      case 'setboostchannel':
        await handleSetBoostChannel(interaction);
        break;
      case 'removequestchannel':
        await handleRemoveQuestChannel(interaction);
        break;
      case 'removeboostchannel':
        await handleRemoveBoostChannel(interaction);
        break;
      case 'questsettings':
        await handleQuestSettings(interaction);
        break;
      case 'setprefix':
        await handleSetPrefix(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling quest bot command:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
  }
});

// Command handlers
async function handleSetQuestChannel(interaction: any) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({ content: '❌ You need **Manage Channels** permission to set quest channels.', ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel('channel');
  const guildId = interaction.guild.id;

  const settings = guildSettings.get(guildId) || {};
  settings.questClaimChannelId = channel.id;
  guildSettings.set(guildId, settings);

  await interaction.reply({
    embeds: [{
      title: '✅ Quest Channel Set',
      description: `Quest completion notifications will now be sent to ${channel}`,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleSetBoostChannel(interaction: any) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({ content: '❌ You need **Manage Channels** permission to set boost channels.', ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel('channel');
  const guildId = interaction.guild.id;

  const settings = guildSettings.get(guildId) || {};
  settings.boostChannelId = channel.id;
  guildSettings.set(guildId, settings);

  await interaction.reply({
    embeds: [{
      title: '✅ Boost Channel Set',
      description: `Server boost notifications will now be sent to ${channel}`,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleRemoveQuestChannel(interaction: any) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({ content: '❌ You need **Manage Channels** permission to remove quest channels.', ephemeral: true });
    return;
  }

  const guildId = interaction.guild.id;
  const settings = guildSettings.get(guildId) || {};
  
  if (!settings.questClaimChannelId) {
    await interaction.reply({ content: '❌ No quest channel is currently set.', ephemeral: true });
    return;
  }

  delete settings.questClaimChannelId;
  guildSettings.set(guildId, settings);

  await interaction.reply({
    embeds: [{
      title: '✅ Quest Channel Removed',
      description: 'Quest completion notifications have been disabled.',
      color: 0xff6b6b,
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleRemoveBoostChannel(interaction: any) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({ content: '❌ You need **Manage Channels** permission to remove boost channels.', ephemeral: true });
    return;
  }

  const guildId = interaction.guild.id;
  const settings = guildSettings.get(guildId) || {};
  
  if (!settings.boostChannelId) {
    await interaction.reply({ content: '❌ No boost channel is currently set.', ephemeral: true });
    return;
  }

  delete settings.boostChannelId;
  guildSettings.set(guildId, settings);

  await interaction.reply({
    embeds: [{
      title: '✅ Boost Channel Removed',
      description: 'Server boost notifications have been disabled.',
      color: 0xff6b6b,
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleQuestSettings(interaction: any) {
  const guildId = interaction.guild.id;
  const settings = guildSettings.get(guildId) || {};

  const embed = new EmbedBuilder()
    .setTitle('🎯 Quest Bot Settings')
    .setColor(0x7c3aed)
    .addFields(
      {
        name: '🎉 Quest Channel',
        value: settings.questClaimChannelId ? `<#${settings.questClaimChannelId}>` : 'Not set',
        inline: true
      },
      {
        name: '🚀 Boost Channel',
        value: settings.boostChannelId ? `<#${settings.boostChannelId}>` : 'Not set',
        inline: true
      },
      {
        name: '⚙️ Command Prefix',
        value: settings.prefix || '!' ,
        inline: true
      }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleSetPrefix(interaction: any) {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    await interaction.reply({ content: '❌ You need **Manage Server** permission to set the command prefix.', ephemeral: true });
    return;
  }

  const prefix = interaction.options.getString('prefix');
  const guildId = interaction.guild.id;

  if (prefix.length > 3) {
    await interaction.reply({ content: '❌ Prefix must be 3 characters or less.', ephemeral: true });
    return;
  }

  const settings = guildSettings.get(guildId) || {};
  settings.prefix = prefix;
  guildSettings.set(guildId, settings);

  await interaction.reply({
    embeds: [{
      title: '✅ Prefix Updated',
      description: `Command prefix is now set to: \`${prefix}\`\n\nTry: \`${prefix}page home\` or \`${prefix}page servers\``,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  });
}

// Handle prefix commands for page information
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const guildId = message.guild?.id;
  if (!guildId) return;

  const settings = guildSettings.get(guildId);
  const prefix = settings?.prefix || '!';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'page') {
    await handlePageCommand(message, args);
  }
});

// Page information command handler
async function handlePageCommand(message: any, args: string[]) {
  if (args.length === 0) {
    await message.reply('Usage: `!page <page_name>` (e.g., `!page home`, `!page servers`, `!page bots`)');
    return;
  }

  const pageName = args[0].toLowerCase();
  const baseUrl = process.env.APP_URL || 'https://smartserve.repl.co';

  try {
    // Fetch page information from website
    const response = await fetch(`${baseUrl}/api/page-info/${pageName}`);
    
    if (!response.ok) {
      await message.reply(`❌ Page "${pageName}" not found. Available pages: home, servers, bots, store, quests`);
      return;
    }

    const pageInfo = await response.json();

    const embed = new EmbedBuilder()
      .setTitle(`📄 ${pageInfo.title || 'Page Information'}`)
      .setDescription(pageInfo.description || 'No description available')
      .setColor(0x7c3aed)
      .setURL(`${baseUrl}${pageInfo.url || '/'}`)
      .setTimestamp();

    if (pageInfo.features && pageInfo.features.length > 0) {
      embed.addFields({
        name: '✨ Features',
        value: pageInfo.features.join('\n'),
        inline: false
      });
    }

    if (pageInfo.stats) {
      embed.addFields({
        name: '📊 Statistics',
        value: Object.entries(pageInfo.stats)
          .map(([key, value]) => `**${key}**: ${value}`)
          .join('\n'),
        inline: false
      });
    }

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching page info:', error);
    await message.reply('❌ Failed to fetch page information. Please try again later.');
  }
}

// Quest completion notification function
export async function sendQuestNotification(guildId: string, userId: string, questData: {
  questId: string;
  questName: string;
  reward: number;
  userTag: string;
  newBalance: number;
}) {
  try {
    const settings = guildSettings.get(guildId);
    if (!settings?.questClaimChannelId) return;

    const channel = await client.channels.fetch(settings.questClaimChannelId);
    if (!channel || !('send' in channel)) return;

    const embed = new EmbedBuilder()
      .setTitle('🎉 Quest Completed!')
      .setDescription(`**${questData.userTag}** completed the **${questData.questName}** quest!`)
      .setColor(0x00ff00)
      .addFields(
        { name: '💰 Reward', value: `${questData.reward} coins`, inline: true },
        { name: '💳 New Balance', value: `${questData.newBalance} coins`, inline: true }
      )
      .setTimestamp();

    await (channel as any).send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending quest notification:', error);
  }
}

// Boost notification function
export async function sendBoostNotification(guildId: string, userTag: string, started: boolean) {
  try {
    const settings = guildSettings.get(guildId);
    if (!settings?.boostChannelId) return;

    const channel = await client.channels.fetch(settings.boostChannelId);
    if (!channel || !('send' in channel)) return;

    const embed = new EmbedBuilder()
      .setTitle(started ? '🚀 Server Boosted!' : '😢 Boost Ended')
      .setDescription(`**${userTag}** ${started ? 'started boosting' : 'stopped boosting'} the server!`)
      .setColor(started ? 0xff69b4 : 0x8b949e)
      .setTimestamp();

    await (channel as any).send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending boost notification:', error);
  }
}

// Login the bot
if (process.env.BOT2_TOKEN) {
  client.login(process.env.BOT2_TOKEN);
} else {
  console.error('❌ BOT2_TOKEN environment variable is not set');
}

export default client;