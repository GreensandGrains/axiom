import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { storage } from './storage';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Store invite usage data
const inviteCache = new Map();

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('bump')
    .setDescription('Bump your server to all bump channels'),

  new SlashCommandBuilder()
    .setName('bumptools')
    .setDescription('Get information about bump tools and settings'),

  new SlashCommandBuilder()
    .setName('bumpchannel')
    .setDescription('Set or manage the bump channel for this server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the current channel as the bump channel')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove bump channel from this server')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Show current bump channel settings')
    ),

  new SlashCommandBuilder()
    .setName('support')
    .setDescription('Contact Smart Serve support team')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your support message')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('addtemplate')
    .setDescription('Apply a server template to your server')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The template link to apply')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('templateprocess')
    .setDescription('Check the progress of template application'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get info about')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Set welcome message for new members')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send welcome messages')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Welcome message (use {user} and {server} as placeholders)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('setgoodbye')
    .setDescription('Set goodbye message when members leave')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send goodbye messages')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Goodbye message (use {user} as placeholder)')
        .setRequired(false)
    ),


  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Poll question')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('First option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Second option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Third option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option4')
        .setDescription('Fourth option')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Create a verification panel')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to give when verified')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role message')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to give')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji to react with')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Custom message')
        .setRequired(false)
    ),

  // New slash command for bot review
  new SlashCommandBuilder()
    .setName('accept')
    .setDescription('Review and accept/decline a bot submission')
    .addStringOption(option =>
      option.setName('bot_id')
        .setDescription('The ID of the bot to review')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user ID of the bot owner')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the bot')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('reviewed_by')
        .setDescription('The user ID of the reviewer')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option.setName('decision')
        .setDescription('True to accept, false to decline')
        .setRequired(true)
    ),
];

client.once('clientReady', async () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}!`);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }

  // Cache existing invites for all guilds
  for (const guild of Array.from(client.guilds.cache.values())) {
    try {
      const invites = await guild.invites.fetch();
      inviteCache.set(guild.id, new Map(invites.map((invite: any) => [invite.code, invite.uses || 0])));
    } catch (error) {
      console.error(`Failed to fetch invites for guild ${guild.name}:`, error);
    }
  }
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'bump':
        await handleBumpCommand(interaction);
        break;
      case 'bumptools':
        await handleBumpToolsCommand(interaction);
        break;
      case 'bumpchannel':
        await handleBumpChannelCommand(interaction);
        break;
      case 'support':
        await handleSupportCommand(interaction);
        break;
      case 'addtemplate':
        await handleAddTemplateCommand(interaction);
        break;
      case 'templateprocess':
        await handleTemplateProcessCommand(interaction);
        break;
      case 'ping':
        await interaction.reply('Pong! 🏓');
        break;
      case 'serverinfo':
        if (!interaction.guild) {
          await interaction.reply('This command can only be used in a server!');
          return;
        }
        const serverInfoEmbed = new EmbedBuilder()
          .setTitle(`${interaction.guild.name} Information`)
          .setThumbnail(interaction.guild.iconURL())
          .addFields(
            { name: 'Server ID', value: interaction.guild.id, inline: true },
            { name: 'Member Count', value: interaction.guild.memberCount.toString(), inline: true },
            { name: 'Created', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:F>`, inline: true }
          )
          .setColor('#7289DA');
        await interaction.reply({ embeds: [serverInfoEmbed] });
        break;
      case 'userinfo': {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);
        const userInfoEmbed = new EmbedBuilder()
          .setTitle(`${user.username} Information`)
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
          )
          .setColor('#7289DA');
        if (member) {
          userInfoEmbed.addFields(
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`, inline: true }
          );
        }
        await interaction.reply({ embeds: [userInfoEmbed] });
        break;
      }
      case 'setwelcome': {
        if (!interaction.guild) {
          await interaction.reply('This command can only be used in a server!');
          return;
        }
        const memberPerms = interaction.guild.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has('ManageGuild')) {
          await interaction.reply('You need the "Manage Server" permission to use this command!');
          return;
        }
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message') || 'Welcome {user} to {server}!';
        await storage.updateGuildSettings(interaction.guild.id, {
          welcomeChannelId: channel?.id,
          welcomeMessage: message,
        });
        await interaction.reply(`Welcome message set for ${channel}!\nMessage: ${message}`);
        break;
      }
      case 'setgoodbye': {
        if (!interaction.guild) {
          await interaction.reply('This command can only be used in a server!');
          return;
        }
        const memberPerms = interaction.guild.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has('ManageGuild')) {
          await interaction.reply('You need the "Manage Server" permission to use this command!');
          return;
        }
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message') || 'Goodbye {user}!';
        await storage.updateGuildSettings(interaction.guild.id, {
          goodbyeChannelId: channel?.id,
          goodbyeMessage: message,
        });
        await interaction.reply(`Goodbye message set for ${channel}!\nMessage: ${message}`);
        break;
      }
      case 'addtemplate': {
        const link = interaction.options.getString('link', true);
        if (!link.includes('smartserve.repl.co/template/')) {
          await interaction.reply('Invalid template link! Please use a valid Smart Serve template link.');
          return;
        }
        const memberPerms = interaction.guild?.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has('Administrator')) {
          await interaction.reply('You need Administrator permission to use this command!');
          return;
        }
        await interaction.deferReply();
        try {
          const templateId = link.split('/template/')[1].split('?')[0];
          const response = await fetch(`https://smartserve.repl.co/api/templates/${templateId}`);
          if (!response.ok) {
            await interaction.editReply('Template not found!');
            return;
          }
          const template = await response.json();
          const guild = interaction.guild!;
          for (const channel of Array.from(guild.channels.cache.values())) {
            if (channel.type !== 4 && channel.id !== guild.systemChannelId) {
              try { await channel.delete(); } catch (error) { console.log(`Could not delete channel ${channel.name}`); }
            }
          }
          for (const role of Array.from(guild.roles.cache.values())) {
            if (role.name !== '@everyone' && !role.managed) {
              try { await role.delete(); } catch (error) { console.log(`Could not delete role ${role.name}`); }
            }
          }
          for (const roleData of template.roles || []) {
            try { await guild.roles.create({ name: roleData.name, color: roleData.color, permissions: roleData.permissions, position: roleData.position, mentionable: roleData.mentionable }); } catch (error) { console.log(`Could not create role ${roleData.name}`); }
          }
          for (const channelData of template.channels || []) {
            try {
              if (channelData.type === 'category') { await guild.channels.create({ name: channelData.name, type: 4, position: channelData.position }); } else { await guild.channels.create({ name: channelData.name, type: channelData.type === 'text' ? 0 : 2, parent: channelData.categoryId, position: channelData.position }); }
            } catch (error) { console.log(`Could not create channel ${channelData.name}`); }
          }
          await interaction.editReply(`✅ Template "${template.name}" has been successfully applied to your server!`);
        } catch (error) {
          console.error('Error applying template:', error);
          await interaction.editReply('❌ Failed to apply template. Please try again later.');
        }
        break;
      }
      case 'templateprocess': {
        await interaction.deferReply();
        if (!interaction.guild) { await interaction.editReply('This command can only be used in a server!'); return; }
        const guild = interaction.guild;
        const channels = guild.channels.cache;
        const roles = guild.roles.cache;
        const embed = new EmbedBuilder()
          .setTitle('📊 Server Template Process Status')
          .setDescription(`Current status of ${guild.name}`)
          .addFields(
            { name: '📁 Channels', value: `${channels.size} channels created`, inline: true },
            { name: '🏷️ Roles', value: `${roles.size} roles created`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount} members`, inline: true }
          )
          .setColor('#0099ff')
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        break;
      }
      case 'poll': {
        const question = interaction.options.getString('question', true);
        const option1 = interaction.options.getString('option1', true);
        const option2 = interaction.options.getString('option2', true);
        const option3 = interaction.options.getString('option3');
        const option4 = interaction.options.getString('option4');
        const embed = new EmbedBuilder()
          .setTitle('📊 Poll')
          .setColor('#0099ff')
          .setTimestamp();
        const options = [option1, option2, option3, option4].filter(Boolean);
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
        let description = question + '\n\n';
        options.forEach((option, index) => { description += `${emojis[index]} ${option}\n`; });
        embed.setDescription(description);
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
        for (let i = 0; i < options.length; i++) { await reply.react(emojis[i]); }
        break;
      }
      case 'verify': {
        if (!interaction.guild) { await interaction.reply('This command can only be used in a server!'); return; }
        const memberPerms = interaction.guild.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has('ManageGuild')) { await interaction.reply('You need the "Manage Server" permission to use this command!'); return; }
        const role = interaction.options.getRole('role', true);
        const embed = new EmbedBuilder()
          .setTitle('✅ Verification Panel')
          .setDescription('Click the button below to get verified!')
          .setColor('#00ff00');
        const button = new ButtonBuilder()
          .setCustomId(`verify_${role.id}`)
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅');
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await interaction.reply({ embeds: [embed], components: [row] });
        break;
      }
      case 'reactionrole': {
        if (!interaction.guild) { await interaction.reply('This command can only be used in a server!'); return; }
        const memberPerms = interaction.guild.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has('ManageRoles')) { await interaction.reply('You need the "Manage Roles" permission to use this command!'); return; }
        const role = interaction.options.getRole('role', true);
        const emoji = interaction.options.getString('emoji', true);
        const message = interaction.options.getString('message') || 'React to get the role!';
        const embed = new EmbedBuilder()
          .setTitle('🎭 Reaction Roles')
          .setDescription(`${message}\n\nReact with ${emoji} to get ${role}`)
          .setColor('#ff6b6b');
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
        await reply.react(emoji);
        await storage.addReactionRole(interaction.guild.id, reply.id, emoji, role.id);
        break;
      }
      case 'accept': {
        if (!interaction.guild) {
          await interaction.reply('This command can only be used in a server!');
          return;
        }
        // Ensure only admins can use this command
        const memberPerms = interaction.guild.members.cache.get(interaction.user.id);
        if (!memberPerms?.permissions.has(PermissionsBitField.Flags.Administrator)) {
          await interaction.reply({ content: '❌ You need Administrator permissions to use this command.', ephemeral: true });
          return;
        }

        const botId = interaction.options.getString('bot_id', true);
        const botOwnerId = interaction.options.getUser('user', true).id;
        const botDescription = interaction.options.getString('description', true);
        const reviewedById = interaction.options.getUser('reviewed_by', true).id;
        const isAccepted = interaction.options.getBoolean('decision', true);

        const bot = await storage.getBot(botId);
        if (!bot) {
          await interaction.reply({ content: '❌ Bot not found in the database.', ephemeral: true });
          return;
        }

        if (bot.ownerId !== botOwnerId) {
          await interaction.reply({ content: '❌ The provided user is not the owner of this bot.', ephemeral: true });
          return;
        }

        const reviewer = await storage.getUserByDiscordId(reviewedById);
        if (!reviewer) {
          await interaction.reply({ content: '❌ Reviewer not found in the database.', ephemeral: true });
          return;
        }

        if (isAccepted) {
          // Bot accepted
          await storage.updateBot(botId, { verified: true });

          // Send green embed message
          const embed = new EmbedBuilder()
            .setTitle('✅ Bot Accepted')
            .setDescription(`**${bot.name}** has been reviewed and accepted by **${interaction.user.tag}**.`)
            .addFields(
              { name: 'Bot ID', value: botId, inline: true },
              { name: 'Owner', value: `<@${botOwnerId}>`, inline: true },
              { name: 'Description', value: botDescription, inline: false },
              { name: 'Reviewed By', value: `<@${reviewedById}>`, inline: true }
            )
            .setColor('#00FF00')
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });

          // Send bot profile with invite link
          const botProfileEmbed = new EmbedBuilder()
            .setTitle(`Bot Profile: ${bot.name}`)
            .setDescription(`${bot.description}`)
            .setColor('#7289DA')
            .addFields(
              { name: 'Invite Link', value: bot.inviteLink }
            )
            .setFooter({ text: `Provided by Bot Owner` });

          const owner = await client.users.fetch(botOwnerId);
          try {
            await owner.send({ embeds: [botProfileEmbed] });
          } catch (dmError) {
            console.log(`Could not send bot profile DM to ${botOwnerId}`);
          }

        } else {
          // Bot declined
          await storage.updateBot(botId, { verified: false });

          // Send red embed message
          const embed = new EmbedBuilder()
            .setTitle('❌ Bot Declined')
            .setDescription(`**${bot.name}** has been reviewed and declined by **${interaction.user.tag}**.`)
            .addFields(
              { name: 'Bot ID', value: botId, inline: true },
              { name: 'Owner', value: `<@${botOwnerId}>`, inline: true },
              { name: 'Description', value: botDescription, inline: false },
              { name: 'Reviewed By', value: `<@${reviewedById}>`, inline: true }
            )
            .setColor('#FF0000')
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });

          // Send message to owner about decline and link to fair use page
          const declineEmbed = new EmbedBuilder()
            .setTitle('Bot Declined')
            .setDescription(`Your bot **${bot.name}** was declined. Please review our fair use policy for more information.`)
            .setColor('#FF0000')
            .addFields(
              { name: 'Link to Fair Use Policy', value: '[Fair Use Policy](https://yourwebsite.com/fair-use)' }
            );

          const owner = await client.users.fetch(botOwnerId);
          try {
            await owner.send({ embeds: [declineEmbed] });
          } catch (dmError) {
            console.log(`Could not send decline DM to ${botOwnerId}`);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error handling command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
  }
});

// Button interactions and reaction handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Handle verification buttons
  if (interaction.customId.startsWith('verify_')) {
    const roleId = interaction.customId.split('_')[1];
    const role = interaction.guild?.roles.cache.get(roleId);

    if (!role) {
      await interaction.reply({ content: 'Verification role not found!', ephemeral: true });
      return;
    }

    const member = interaction.guild?.members.cache.get(interaction.user.id);
    if (!member) {
      await interaction.reply({ content: 'Member not found!', ephemeral: true });
      return;
    }

    if (member.roles.cache.has(roleId)) {
      await interaction.reply({ content: 'You are already verified!', ephemeral: true });
      return;
    }

    try {
      await member.roles.add(role);
      await interaction.reply({ content: `✅ You have been verified and given the ${role.name} role!`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Failed to give you the role. Please contact an administrator.', ephemeral: true });
    }
  }
});

// Handle reaction role events
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  const reactionRole = await storage.getReactionRole(reaction.message.guildId!, reaction.message.id, reaction.emoji.toString());
  if (!reactionRole) return;

  const guild = reaction.message.guild;
  const member = guild?.members.cache.get(user.id);
  const role = guild?.roles.cache.get(reactionRole.roleId);

  if (member && role) {
    try {
      await member.roles.add(role);
      console.log(`Added role ${role.name} to ${user.tag}`);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  const reactionRole = await storage.getReactionRole(reaction.message.guildId!, reaction.message.id, reaction.emoji.toString());
  if (!reactionRole) return;

  const guild = reaction.message.guild;
  const member = guild?.members.cache.get(user.id);
  const role = guild?.roles.cache.get(reactionRole.roleId);

  if (member && role) {
    try {
      await member.roles.remove(role);
      console.log(`Removed role ${role.name} from ${user.tag}`);
    } catch (error) {
      console.error('Error removing role:', error);
    }
  }
});


async function handleBumpCommand(interaction: any) {
  await interaction.deferReply();

  try {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    // Check if server has bump enabled
    const serverData = await storage.getServerByDiscordId(guildId);
    if (!serverData || !serverData.bumpEnabled) {
      await interaction.editReply({
        content: '❌ Bump is not enabled for this server. Server owners can enable it on the Smart Serve website.'
      });
      return;
    }

    // Check cooldown (2 hours between bumps)
    const lastBump = await storage.getLastBump(guildId);
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (lastBump && Date.now() - lastBump.getTime() < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (Date.now() - lastBump.getTime())) / (60 * 1000));
      await interaction.editReply({
        content: `⏰ Server is on cooldown. You can bump again in ${remainingTime} minutes.`
      });
      return;
    }

    // Get all bump channels from all servers
    const bumpChannels = await storage.getAllBumpChannels();
    let successCount = 0;
    let errorCount = 0;

    // Create bump embed
    const bumpEmbed = new EmbedBuilder()
      .setTitle(`🚀 ${interaction.guild.name}`)
      .setDescription(serverData.description || 'Join our amazing Discord community!')
      .setColor('#7C3AED')
      .addFields(
        { name: '👥 Members', value: `${interaction.guild.memberCount || 'Unknown'}`, inline: true },
        { name: '🌐 Server', value: serverData.inviteLink, inline: true }
      )
      .setThumbnail(interaction.guild.iconURL() || null)
      .setFooter({ text: 'Powered by Smart Serve', iconURL: client.user?.avatarURL() || undefined })
      .setTimestamp();

    // Send bump to all channels
    for (const channelData of bumpChannels) {
      try {
        if (channelData.serverId === guildId) continue; // Don't bump to own server

        const channel = await client.channels.fetch(channelData.channelId);
        if (channel && channel.type === ChannelType.GuildText) {
          await (channel as any).send({ embeds: [bumpEmbed] });
          successCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to send bump to channel ${channelData.channelId}:`, error);
      }
    }

    // Update last bump time
    await storage.updateLastBump(guildId);

    await interaction.editReply({
      content: `✅ Successfully bumped to ${successCount} servers! ${errorCount > 0 ? `(${errorCount} failed)` : ''}`
    });

  } catch (error) {
    console.error('Bump command error:', error);
    await interaction.editReply({
      content: '❌ An error occurred while bumping your server.'
    });
  }
}

async function handleBumpToolsCommand(interaction: any) {
  const embed = new EmbedBuilder()
    .setTitle('🛠️ Bump Tools')
    .setDescription('Information about Smart Serve bump system')
    .setColor('#7C3AED')
    .addFields(
      { name: '📢 /bump', value: 'Bump your server to all bump channels (2 hour cooldown)', inline: false },
      { name: '🔧 /bumpchannel set', value: 'Set current channel as bump channel', inline: false },
      { name: '❌ /bumpchannel remove', value: 'Remove bump channel', inline: false },
      { name: '📊 /bumpchannel info', value: 'View bump channel settings', inline: false },
      { name: '⚙️ /setbump', value: 'Get server management link', inline: false }
    )
    .setFooter({ text: 'Powered by Smart Serve' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleBumpChannelCommand(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  // Check if user has manage channels permission
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({
      content: '❌ You need **Manage Channels** permission to use this command.',
      ephemeral: true
    });
    return;
  }

  switch (subcommand) {
    case 'set':
      try {
        await storage.setBumpChannel(interaction.guild.id, interaction.channel.id);
        await interaction.reply({
          content: `✅ Successfully set ${interaction.channel} as the bump channel!`
        });
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to set bump channel.',
          ephemeral: true
        });
      }
      break;

    case 'remove':
      try {
        await storage.removeBumpChannel(interaction.guild.id);
        await interaction.reply({
          content: '✅ Successfully removed bump channel!'
        });
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to remove bump channel.',
          ephemeral: true
        });
      }
      break;

    case 'info':
      try {
        const bumpChannel = await storage.getBumpChannel(interaction.guild.id);
        if (bumpChannel) {
          const channel = await client.channels.fetch(bumpChannel.channelId);
          await interaction.reply({
            content: `📊 Current bump channel: ${channel}`
          });
        } else {
          await interaction.reply({
            content: '📊 No bump channel set for this server.'
          });
        }
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to get bump channel info.',
          ephemeral: true
        });
      }
      break;
  }
}

async function handleAddTemplateCommand(interaction: any) {
  // Check if user has administrator permission
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({
      content: '❌ You need **Administrator** permission to apply server templates.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply();

  try {
    const templateLink = interaction.options.getString('link');
    const guildId = interaction.guild.id;

    // Validate template link
    const response = await fetch(`${process.env.APP_URL || 'https://smartserve.repl.co'}/api/templates/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateLink, guildId }),
    });

    if (!response.ok) {
      await interaction.editReply({
        content: '❌ Invalid template link or template not found.'
      });
      return;
    }

    const templateData = await response.json();

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Template Application Warning')
      .setDescription(`You are about to apply the template: **${templateData.name}**`)
      .setColor('#FF6B6B')
      .addFields(
        { name: '🗑️ This will:', value: '• Delete ALL existing channels\n• Delete ALL existing roles (except @everyone and bot roles)\n• Create new channels and roles from template', inline: false },
        { name: '📊 Template includes:', value: `• ${templateData.channels?.length || 0} channels\n• ${templateData.roles?.length || 0} roles`, inline: false },
        { name: '⚠️ Warning:', value: 'This action cannot be undone! Make sure you have backed up any important settings.', inline: false }
      )
      .setFooter({ text: 'Use the command again within 60 seconds to confirm' });

    await interaction.editReply({ embeds: [confirmEmbed] });

    // Store pending template application
    await storage.setPendingTemplate(guildId, {
      templateLink,
      templateData,
      userId: interaction.user.id,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Add template command error:', error);
    await interaction.editReply({
      content: '❌ An error occurred while processing the template.'
    });
  }
}

async function handleTemplateProcessCommand(interaction: any) {
  await interaction.deferReply();

  try {
    const guildId = interaction.guild.id;
    const process = await storage.getTemplateProcess(guildId);

    if (!process) {
      await interaction.editReply({
        content: '📊 No template application process found for this server.'
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Template Application Progress')
      .setColor('#7C3AED')
      .addFields(
        { name: '🏷️ Template Name', value: process.templateName || 'Unknown', inline: true },
        { name: '📈 Status', value: process.status || 'In Progress', inline: true },
        { name: '📅 Started', value: `<t:${Math.floor(process.startedAt / 1000)}:R>`, inline: true },
        { name: '🗑️ Channels Deleted', value: `${process.channelsDeleted || 0}`, inline: true },
        { name: '🛡️ Roles Deleted', value: `${process.rolesDeleted || 0}`, inline: true },
        { name: '➕ Channels Created', value: `${process.channelsCreated || 0}/${process.totalChannels || 0}`, inline: true },
        { name: '🎭 Roles Created', value: `${process.rolesCreated || 0}/${process.totalRoles || 0}`, inline: true },
        { name: '⏱️ Estimated Time Remaining', value: process.eta || 'Calculating...', inline: true }
      );

    if (process.errors && process.errors.length > 0) {
      embed.addFields({
        name: '❌ Errors',
        value: process.errors.slice(0, 3).join('\n') + (process.errors.length > 3 ? '\n...and more' : ''),
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Template process command error:', error);
    await interaction.editReply({
      content: '❌ An error occurred while checking the template process.'
    });
  }
}

async function handleSupportCommand(interaction: any) {
  const message = interaction.options.getString('message');
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const guildName = interaction.guild?.name || 'Direct Message';

  try {
    // Create support ticket in database
    // Get user from database by Discord ID
    const user = await storage.getUserByDiscordId(userId);
    if (user) {
      await storage.createSupportTicket({
        subject: 'Discord Support Request',
        category: 'general',
        description: message,
        priority: 'medium',
        userId: user.id
      });
    }

    // Send confirmation to user
    await interaction.reply({
      content: '✅ Your support request has been submitted! Our team will respond via DM within 24 hours.',
      ephemeral: true
    });

    // Send DM to user with ticket confirmation
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('🎫 Support Ticket Created')
        .setDescription('Thank you for contacting Smart Serve support!')
        .setColor('#00FF00')
        .addFields(
          { name: '📝 Your Message:', value: message, inline: false },
          { name: '⏰ Response Time:', value: 'Our team typically responds within 24 hours', inline: false },
          { name: '🔗 Need More Help?', value: `[Visit Help Center](https://smartserve.repl.co/help-center)`, inline: false }
        )
        .setFooter({ text: 'Smart Serve Support Team' })
        .setTimestamp();

      await interaction.user.send({ embeds: [dmEmbed] });
    } catch (dmError) {
      console.log(`Could not send DM confirmation to ${username}`);
    }

    // Notify admin channel or specific admin users
    const ADMIN_USER_IDS = ['123456789']; // Add actual admin Discord IDs here

    for (const adminId of ADMIN_USER_IDS) {
      try {
        const adminUser = await client.users.fetch(adminId);
        const adminEmbed = new EmbedBuilder()
          .setTitle('🆘 New Support Ticket')
          .setColor('#FF6B6B')
          .addFields(
            { name: '👤 User:', value: `${username} (${userId})`, inline: true },
            { name: '🏠 Server:', value: guildName, inline: true },
            { name: '📝 Message:', value: message, inline: false },
            { name: '⚡ Quick Actions:', value: `Reply: \`/dm ${userId} [message]\`\nClose: \`/close-ticket ${userId}\``, inline: false }
          )
          .setTimestamp();

        await adminUser.send({ embeds: [adminEmbed] });
      } catch (adminError) {
        console.log(`Could not notify admin ${adminId}`);
      }
    }

  } catch (error) {
    console.error('Support command error:', error);
    await interaction.reply({
      content: '❌ Failed to submit support request. Please try again later.',
      ephemeral: true
    });
  }
}

// Track invite usage when someone joins
client.on('GuildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    const cachedInvites = inviteCache.get(guild.id) || new Map();
    const newInvites = await guild.invites.fetch();

    // Find which invite was used
    const usedInvite = newInvites.find((invite: any) => {
      const cachedUses = cachedInvites.get(invite.code) || 0;
      return (invite.uses || 0) > cachedUses;
    });

    if (usedInvite && usedInvite.inviter) {
      console.log(`${member.user.tag} joined using invite by ${usedInvite.inviter.tag}`);

      // Award coins to the inviter and complete invite quest
      const inviterUser = await storage.getUserByDiscordId(usedInvite.inviter.id);
      if (inviterUser) {
        const coinsToAward = 3; // 3 coins for successful invite (as per quest)
        const newBalance = (inviterUser.coins || 0) + coinsToAward;

        // Update user data
        const updatedInviteCount = (inviterUser.inviteCount || 0) + 1;
        await Promise.all([
          storage.updateUserCoins(inviterUser.id, newBalance),
          storage.updateUser(inviterUser.id, {
            inviteCount: updatedInviteCount
          })
        ]);

        console.log(`Awarded ${coinsToAward} coins to ${usedInvite.inviter.tag} for inviting ${member.user.tag}. Total invites: ${updatedInviteCount}`);

        // Send DM to the inviter
        try {
          await usedInvite.inviter.send(
            `🎉 You earned ${coinsToAward} coins for inviting ${member.user.tag} to ${guild.name}! Your balance is now ${newBalance} coins. Total invites: ${updatedInviteCount}`
          );
        } catch (dmError) {
          console.log(`Could not send DM to ${usedInvite.inviter.tag}`);
        }
      }
    }

    // Award welcome bonus and update quest progress for new member
    const newMemberUser = await storage.getUserByDiscordId(member.id);
    if (newMemberUser) {
      const welcomeBonus = 2; // 2 coins welcome bonus
      const newMemberBalance = (newMemberUser.coins || 0) + welcomeBonus;

      // Update coins and servers joined count for quest progress
      await Promise.all([
        storage.updateUserCoins(newMemberUser.id, newMemberBalance),
        storage.updateUser(newMemberUser.id, {
          serversJoined: (newMemberUser.serversJoined || 0) + 1
        })
      ]);

      try {
        await member.send(
          `Welcome to ${guild.name}! 🎉 You received ${welcomeBonus} coins as a welcome bonus and completed the "Join Server" quest!`
        );
      } catch (dmError) {
        console.log(`Could not send welcome DM to ${member.user.tag}`);
      }
    }

    // Update cached invites
    inviteCache.set(guild.id, new Map(newInvites.map((invite: any) => [invite.code, invite.uses || 0])));

  } catch (error) {
    console.error('Error tracking invite usage:', error);
  }
});

// Quest tracking for member join events
client.on('guildMemberAdd', async (member) => {
  // Only process joins for our main server
  const MAIN_SERVER_ID = "1416385340922658838";
  if (member.guild.id !== MAIN_SERVER_ID) return;

  try {
    // Find user by Discord ID
    const user = await storage.getUserByDiscordId(member.user.id);

    if (!user) {
      console.log(`User ${member.user.tag} joined but not found in database`);
      return;
    }

    // Parse metadata safely
    let questData = {};
    try {
      questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
    } catch (parseError) {
      console.error('Error parsing user metadata:', parseError);
      questData = {};
    }
    const completions = (questData as any).questCompletions || [];

    // Check if join-server quest already completed
    if (completions.some((c: any) => c.questId === "join-server")) {
      console.log(`User ${member.user.tag} already completed join-server quest`);
      return;
    }

    // Award coins for joining server
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

    await storage.updateUser(user.id, {
      coins: newCoins,
      metadata: JSON.stringify(newMetadata)
    });

    console.log(`✅ User ${user.discordId} completed join-server quest and earned ${coinsEarned} coins`);

    // Send notification to quest bot channel if configured
    try {
      const { sendQuestNotification } = await import('./quest-bot');
      await sendQuestNotification(MAIN_SERVER_ID, user.discordId, {
        questId: "join-server",
        questName: "Join Server",
        reward: coinsEarned,
        userTag: member.user.tag,
        newBalance: newCoins
      });
    } catch (error) {
      console.log('Quest notification system not available:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Send welcome DM with quest completion notification
    try {
      await member.send({
        embeds: [{
          title: "🎉 Welcome & Quest Completed!",
          description: `Welcome to **${member.guild.name}**!\n\nYou've automatically completed the **Join Server** quest and earned **${coinsEarned} coins**!\n\nYour new balance: **${newCoins} coins**`,
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Smart Serve - Quest System",
            icon_url: client.user?.displayAvatarURL()
          }
        }]
      });
    } catch (dmError) {
      console.log(`Could not send welcome DM to ${member.user.tag}`);
    }
  } catch (error) {
    console.error('Error handling member join for quest:', error);
  }
});

// Handle server boost events
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Only process boosts for our main server
  const MAIN_SERVER_ID = "1416385340922658838";
  if (newMember.guild.id !== MAIN_SERVER_ID) return;

  try {
    // Check if user started boosting
    const wasBoosting = oldMember.premiumSince !== null;
    const isBoosting = newMember.premiumSince !== null;

    if (!wasBoosting && isBoosting) {
      // User started boosting
      const user = await storage.getUserByDiscordId(newMember.user.id);

      if (!user) {
        console.log(`User ${newMember.user.tag} boosted but not found in database`);
        return;
      }

      // Parse metadata safely
      let questData = {};
      try {
        questData = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {});
      } catch (parseError) {
        console.error('Error parsing user metadata:', parseError);
        questData = {};
      }
      const completions = (questData as any).questCompletions || [];

      // Check if boost quest already completed
      if (completions.some((c: any) => c.questId === "boost-server")) {
        console.log(`User ${newMember.user.tag} already completed boost-server quest`);
        return;
      }

      // Award coins for boosting server
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

      await storage.updateUser(user.id, {
        coins: newCoins,
        metadata: JSON.stringify(newMetadata)
      });

      console.log(`✅ User ${user.discordId} completed boost-server quest and earned ${coinsEarned} coins`);

      // Send thank you DM with quest completion notification
      try {
        await newMember.send({
          embeds: [{
            title: "🚀 Thank You for Boosting!",
            description: `Thank you for boosting **${newMember.guild.name}**!\n\nYou've completed the **Server Boost** quest and earned **${coinsEarned} coins**!\n\nYour new balance: **${newCoins} coins**`,
            color: 0xff6b6b,
            timestamp: new Date().toISOString(),
            footer: {
              text: "Smart Serve - Quest System",
              icon_url: client.user?.displayAvatarURL()
            }
          }]
        });
      } catch (dmError) {
        console.log(`Could not send boost thank you DM to ${newMember.user.tag}`);
      }
    }
  } catch (error) {
    console.error('Error handling member boost for quest:', error);
  }
});

// Guild member remove event (user leaves server)
client.on('guildMemberRemove', async (member) => {
  console.log(`Member left: ${member.user.username} from ${member.guild.name}`);

  try {
    // Find the user in our database by Discord ID
    const user = await storage.getUserByDiscordId(member.user.id);
    if (!user) {
      console.log(`User ${member.user.username} not found in database`);
      return;
    }

    // Handle server leave and potential coin deduction
    const result = await storage.handleServerLeave(user.id, member.guild.id);

    if (result && result.coinsDeducted > 0) {
      console.log(`User ${member.user.username} left ${member.guild.name} within 3 days. Deducted ${result.coinsDeducted} coins. New balance: ${result.newBalance}`);

      // Send DM to user about coin deduction
      try {
        await member.user.send({
          embeds: [{
            title: "⚠️ Coin Deduction Notice",
            description: `You left **${member.guild.name}** within 3 days of joining and lost **${result.coinsDeducted} coins**.\n\nTo avoid coin penalties, stay in servers for at least 3 days after joining.\n\nNew balance: **${result.newBalance} coins**`,
            color: 0xff6b6b,
            timestamp: new Date().toISOString(),
            footer: {
              text: "Smart Serve - Coin System",
              icon_url: client.user?.displayAvatarURL()
            }
          }]
        });
      } catch (dmError) {
        console.log(`Could not send DM to ${member.user.username}:`, dmError);
      }
    } else if (result) {
      console.log(`User ${member.user.username} left ${member.guild.name} after 3+ days. No coin penalty.`);
    }
  } catch (error) {
    console.error(`Error handling member leave for ${member.user.username}:`, error);
  }
});


// Update invite cache when new invites are created
client.on('InviteCreate', async (invite) => {
  const guildInvites = inviteCache.get(invite.guild?.id) || new Map();
  guildInvites.set(invite.code, invite.uses || 0);
  inviteCache.set(invite.guild?.id, guildInvites);
});

// Clean up deleted invites
client.on('InviteDelete', async (invite) => {
  const guildInvites = inviteCache.get(invite.guild?.id) || new Map();
  guildInvites.delete(invite.code);
  inviteCache.set(invite.guild?.id, guildInvites);
});

export async function startDiscordBot() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }

  try {
    await client.login(botToken);
  } catch (error) {
    console.error('❌ Failed to login Discord bot:', error);
  }
}

export { client as discordBot };