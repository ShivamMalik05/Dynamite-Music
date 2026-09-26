const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

function formatSeconds(seconds) {
  if (seconds === 0) return 'Disabled';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const minsLeft = mins % 60;
  return minsLeft > 0 ? `${hours}h ${minsLeft}m` : `${hours}h`;
}

module.exports = {
  name: 'slowmode',
  description: 'Set channel slowmode',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addIntegerOption(option =>
      option.setName('seconds').setDescription('Slowmode in seconds (0 to disable, max 21600)').setRequired(true))
    .addChannelOption(option =>
      option.setName('channel').setDescription('Channel (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context, args) {
    if (!(await checkPermission(context, 'slowmode'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let seconds, moderatorTag, moderatorId, client, guild, channel;

    if (isSlash) {
      seconds = context.options.getInteger('seconds');
      channel = context.options.getChannel('channel') || context.channel;
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ManageChannels')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      seconds = parseInt(args[0]);
      channel = context.channel;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      client = context.client;
      guild = context.guild;
    }

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      const msg = await context.reply(`${emojis.error} Provide seconds between 0 and 21600 (6 hours).`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (!channel) {
      const msg = await context.reply(`${emojis.error} Channel not found.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    try {
      await channel.setRateLimitPerUser(seconds);
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to set slowmode: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    const isDisabled = seconds === 0;
    const durationText = formatSeconds(seconds);

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(isDisabled ? 0x57F287 : 0x5865F2)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.slowmode} Slowmode ${isDisabled ? 'Disabled' : 'Updated'}`)
      .setDescription(
        isDisabled
          ? `> Slowmode has been **disabled** in ${channel}.`
          : `> Slowmode set to **${durationText}** in ${channel}.`
      )
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    if (isSlash) {
      await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => context.deleteReply().catch(() => {}), 3000);
    } else {
      const sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
    }

    // Log
    await sendLog(client, 'moderation', {
      emoji: emojis.slowmode,
      title: 'Slowmode Updated',
      subtitle: 'Channel slowmode was changed',
      fields: [
        { name: '📢 Channel', value: `<#${channel.id}>` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '⏱️ Slowmode', value: durationText },
      ],
    });
  },
};
