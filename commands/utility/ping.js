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
  name: 'ping',
  description: 'Check bot latency',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  async execute(context) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    const client = context.client;

    const sent = isSlash
      ? await context.reply({ content: 'Pinging...', fetchReply: true })
      : await context.reply('Pinging...');

    const latency = sent.createdTimestamp - (isSlash ? context.createdTimestamp : context.createdTimestamp);
    const wsLatency = client.ws.ping;
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.ping || emojis.stats} Pong!\n` +
          `**Bot Latency Information**`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emojis.dot} **Message Latency:** \`${latency}ms\`\n` +
          `${emojis.dot} **WebSocket:** \`${wsLatency}ms\`\n` +
          `${emojis.dot} **Uptime:** \`${days}d ${hours}h ${minutes}m ${seconds}s\``
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
      );

    if (isSlash) {
      await context.editReply({
        content: null,
        components: [container],
        flags: 1 << 15,
      });
    } else {
      await sent.edit({
        content: null,
        components: [container],
        flags: 1 << 15,
      });
    }
  },
};
