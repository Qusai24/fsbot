require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  Events,
  REST,
  Routes,
} = require('discord.js');
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Keep-alive HTTP server for Render Web Service
const http = require('http');
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Discord bot is active and running.');
}).listen(port, () => {
    console.log(`Web server listening on port ${port}`);
});

// ============================================================
// 🔧 CONFIGURATION
// ============================================================
const CLIENT_ID = '1519719117362561209'; 
const GUILD_ID = '1519424081617752135'; 
const MEDIA_CHANNELS = ['1519426411964796928', '1519426434471297044','1519427369432252546','1519427287936667832','1519441308383711423',
  '1519441358828605580','1519442482214080642','1519441358828605580','1519442482214080642','1519442747201949776','1519680056832557277',
  '1519680373439856711','1519689337212764281','1519689337212764281','1519689269357056072','1519680956603306235','1519681022671851530'];
const DRAFT_CHANNEL_ID = '1519703035675279544'; // Replace with your actual channel ID
const ROLE_MAP = {
  role_above18: '1519726660679635095',
  role_below18: '1519726713372807290',
  role_male: '1519726848085463150',
  role_female: '1519726909808840837',
  role_nfs: '1519716545293713591',
  role_assetto: '1519716646347079750',
  role_forza: '1519716892296614151',
  role_carx: '1519716998026756207',
  role_beamng: '1519717065416642560',
  role_crew: '1519717112543711292',
};

const ROLE_LABELS = {
  role_above18: 'Above 18',
  role_below18: 'Below 18',
  role_male: 'Male',
  role_female: 'Female',
  role_nfs: 'Need for Speed',
  role_assetto: 'Assetto Corsa',
  role_forza: 'Forza',
  role_carx: 'Carx',
  role_beamng: 'BeamNG',
  role_crew: 'The Crew',
  role_playstation: 'PlayStation',
  role_xbox: 'Xbox',
  role_pc: 'PC',
  role_xCloud: 'xCloud',
  role_mobile: 'Mobile',
};

const BANNER_IMAGE_URL = 'https://i.postimg.cc/sgH5GmVs/fb9301c5-86d6-418b-9bd9-fbf9037e348f.png'; // <-- Replace with your image URL

const STATUS_CYCLE = [
  { name: '🟢 Green Phase', url: 'https://twitch.tv/twitch' },
  { name: '🟡 Yellow Phase', url: 'https://twitch.tv/twitch' },
  { name: '🔴 Red Phase', url: 'https://twitch.tv/twitch' },
];

let cycleIndex = 0;

function startStatusCycle(currentClient) {
  setInterval(() => {
    const current = STATUS_CYCLE[cycleIndex];

    currentClient.user.setPresence({
      activities: [{
        name: current.name,
        type: ActivityType.Streaming,
        url: current.url,
      }],
      status: 'online',
    });

    cycleIndex = (cycleIndex + 1) % STATUS_CYCLE.length;
  }, 5000);
}

// ============================================================
// SLASH COMMAND REGISTRATION
// ============================================================
const commands = [
  new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Send the self-roles selection message'),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Make the bot send a message to a specific channel.')
    .addChannelOption(option => 
        option.setName('target')
        .setDescription('The channel where the bot will send the message')
        .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('text')
        .setDescription('The message you want the bot to copy and send')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Join your current voice channel and stay deafened for AFK use.')
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// ============================================================
// BUILD THE EMBED + BUTTON ROWS
// ============================================================
function buildRoleMenuMessage() {
  const embed = new EmbedBuilder()
    .setTitle('Tell us about yourself:')
    .setColor(0x2f3136)
    .setImage(BANNER_IMAGE_URL);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_above18')
      .setLabel('Above 18')
      .setEmoji('👱')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_below18')
      .setLabel('Below 18')
      .setEmoji('🔞')
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_male')
      .setLabel('Male')
      .setEmoji('♂️')
      .setStyle(ButtonStyle.Primary), 
    new ButtonBuilder()
      .setCustomId('role_female')
      .setLabel('Female')
      .setEmoji('♀️')
      .setStyle(ButtonStyle.Danger) 
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_nfs')
      .setLabel('Need for Speed')
      .setEmoji('🚓')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_assetto')
      .setLabel('Assetto Corsa')
      .setEmoji('🏁')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_forza')
      .setLabel('Forza')
      .setEmoji('🏎️')
      .setStyle(ButtonStyle.Secondary)
  );
  
  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_carx')
      .setLabel('Carx')
      .setEmoji('🚗')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_beamng')
      .setLabel('BeamNG')
      .setEmoji('🛻')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_crew')
      .setLabel('The Crew')
      .setEmoji('🛩️')
      .setStyle(ButtonStyle.Secondary)
  );
  const row5 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('role_playstation')
      .setLabel('PlayStation')
      .setEmoji('🎮')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_xbox')
      .setLabel('Xbox')
      .setEmoji('🕹️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_pc')
      .setLabel('PC')
      .setEmoji('💻')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_xCloud')
      .setLabel('xCloud')
      .setEmoji('☁️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('role_mobile')
      .setLabel('Mobile')
      .setEmoji('📱')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3, row4, row5] };
}

// ============================================================
// MAIN INTERACTION HANDLER
// ============================================================
client.on(Events.InteractionCreate, async (interaction) => {
  
  // ----------------------------------------------------------
  // 1. HANDLE SLASH COMMANDS
  // ----------------------------------------------------------
  if (interaction.isChatInputCommand()) {
    
    // Command: /rolemenu
    if (interaction.commandName === 'rolemenu') {
      const messagePayload = buildRoleMenuMessage();
      await interaction.reply(messagePayload); 
      return;
    }

    // Command: /announce
    if (interaction.commandName === 'announce') {
      const targetChannel = interaction.options.getChannel('target');
      const messageText = interaction.options.getString('text');

      try {
        await targetChannel.send(messageText);
        await interaction.reply({ 
          content: `✅ Successfully copied your message and sent it to ${targetChannel}!`, 
          ephemeral: true 
        });
      } catch (error) {
        console.error('Announce Error:', error);
        await interaction.reply({ 
          content: `❌ I failed to send the message. Make sure I have "View Channel" and "Send Messages" permissions in ${targetChannel}.`, 
          ephemeral: true 
        });
      }
      return;
    }

    if (interaction.commandName === 'afk') {
      const memberVoiceChannel = interaction.member.voice?.channel;

      if (!memberVoiceChannel) {
        return interaction.reply({
          content: 'You must be in a voice channel to use this command!',
          ephemeral: true,
        });
      }

      try {
        const connection = joinVoiceChannel({
          channelId: memberVoiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true,
          selfMute: false,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

        await interaction.reply({
          content: `Joined and deafened in **${memberVoiceChannel.name}** for AFK.`,
        });
      } catch (error) {
        console.error('AFK join error:', error);
        await interaction.reply({
          content: 'Failed to join the voice channel.',
          ephemeral: true,
        });
      }
      return;
    }
  }

  // ----------------------------------------------------------
  // 2. HANDLE BUTTON CLICKS
  // ----------------------------------------------------------
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('draft_')) {
      const originalMessageId = interaction.customId.split('_')[1];
      const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

      const modal = new ModalBuilder()
          .setCustomId(`send_modal_${originalMessageId}`)
          .setTitle('Publish Announcement');

      const channelInput = new TextInputBuilder()
          .setCustomId('target_channel_id')
          .setLabel('Paste the Target Channel ID:')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(channelInput));
      await interaction.showModal(modal);
      return;
    }

    const roleId = ROLE_MAP[interaction.customId];

    if (!roleId) return;

    if (roleId.startsWith('ROLE_ID_')) {
      await interaction.reply({ content: '⚠️ This role has not been configured yet.', ephemeral: true });
      return;
    }

    try {
      const member = interaction.member; 
      const roleLabel = ROLE_LABELS[interaction.customId];

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({ content: `❌ Removed the **${roleLabel}** role.`, ephemeral: true });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({ content: `✅ Added the **${roleLabel}** role.`, ephemeral: true });
      }
    } catch (error) {
      console.error('Error toggling role:', error);
      await interaction.reply({ content: '⚠️ Something went wrong.', ephemeral: true });
    }
  }

  // ----------------------------------------------------------
  // 4. HANDLE MODAL SUBMIT (SENDS THE MESSAGE)
  // ----------------------------------------------------------
  if (interaction.isModalSubmit() && interaction.customId.startsWith('send_modal_')) {
      const originalMessageId = interaction.customId.split('_')[2];
      const targetChannelId = interaction.fields.getTextInputValue('target_channel_id');

      try {
          // Fetch the message you originally typed
          const draftMessage = await interaction.channel.messages.fetch(originalMessageId);
          // Fetch the channel you want to send it to
          const targetChannel = await client.channels.fetch(targetChannelId);

          // Copy the text and send it!
          await targetChannel.send(draftMessage.content);

          await interaction.reply({ 
              content: `✅ Announcement successfully forwarded to <#${targetChannelId}>!`, 
              ephemeral: true 
          });

      } catch (error) {
          console.error('Draft forwarding error:', error);
          await interaction.reply({ 
              content: '❌ Failed to send. Double check that the Channel ID is correct and that I have permission to type there.', 
              ephemeral: true 
          });
      }
      return;
  }
});

// ============================================================
// BOT READY
// ============================================================
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  startStatusCycle(readyClient);
});

// ============================================================
// MEDIA-ONLY CHANNEL ENFORCER
// ============================================================
client.on(Events.MessageCreate, async (message) => {
  // 1. Ignore messages from bots (prevents infinite loops)
  if (message.author.bot) return;

  // 2. Check if the message was sent in one of our media channels
  if (MEDIA_CHANNELS.includes(message.channelId)) {
      
      // 3. Check if the message has ZERO attachments (no images/videos)
      if (message.attachments.size === 0) {
          try {
              // Delete the text message
              await message.delete();
              
              // Send a quick warning that deletes itself after 5 seconds so the channel stays clean
              const warning = await message.channel.send({
                  content: `⚠️ <@${message.author.id}>, this channel is strictly for media uploads! Text-only messages are not allowed.`
              });
              
              setTimeout(() => {
                  warning.delete().catch(() => {});
              }, 5000);

          } catch (error) {
              console.error('Failed to delete message in media channel:', error);
          }
      }
  }

  // ============================================================
  // ANNOUNCEMENT DRAFT CATCHER
  // ============================================================
  if (message.channelId === DRAFT_CHANNEL_ID) {
      // Create a button that secretly stores the ID of the message you just sent
      const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId(`draft_${message.id}`) 
              .setLabel('Set Target Channel')
              .setStyle(ButtonStyle.Success)
      );

      await message.reply({ 
          content: 'Draft saved! Click below to enter the channel ID where you want to send this:', 
          components: [row] 
      });
  }
});
client.login(process.env.DISCORD_TOKEN);
