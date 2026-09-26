const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

function makeSep() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch {
    return { type: 14, divider: true, spacing: 1 };
  }
}

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show bot and server statistics'),

  async execute(context) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    const client = context.client;
    const guild = context.guild;

    if (!isSlash) {
      setTimeout(() => context.delete().catch(() => {}), 500);
    }

    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = client.ws.ping;

    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.stats} ${client.user.username} Statistics\n` +
          `**Bot & Server Information**`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.info} General Info**\n` +
          `${emojis.dot} **Bot:** ${client.user.username}\n` +
          `${emojis.dot} **Ping:** ${ping}ms\n` +
          `${emojis.dot} **Memory:** ${memory} MB\n` +
          `${emojis.dot} **Uptime:** ${days}d ${hours}h ${minutes}m`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.home} Server Stats**\n` +
          `${emojis.dot} **Name:** ${guild.name}\n` +
          `${emojis.dot} **Members:** ${serverMembers}\n` +
          `${emojis.dot} **Channels:** ${serverChannels}\n` +
          `${emojis.dot} **Roles:** ${serverRoles}\n` +
          `${emojis.dot} **Boosts:** ${serverBoosts}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.verified} Bot Stats**\n` +
          `${emojis.dot} **Servers:** ${totalServers}\n` +
          `${emojis.dot} **Users:** ${totalUsers}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('stats_close')
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [container, row],
      flags: 1 << 15,
    });
  },

  // ===== BUTTON HANDLER =====
  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('stats_')) return false;

    if (id === 'stats_close') {
      try {
        await interaction.message.delete();
      } catch (err) {
        try {
          await interaction.update({ content: 'Stats closed.', components: [], embeds: [] });
        } catch (err2) {
          console.error('Stats close failed:', err2.message);
        }
      }
      return true;
    }

    return false;
  },
};
