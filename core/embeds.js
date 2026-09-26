const { EmbedBuilder } = require('discord.js');
const emojis = require('../emojis/emojis');

// ===== BASE EMBED =====
function baseEmbed(color = 0xFFFFFF, client = null) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setFooter({
      text: 'Powered by Dynamite Music',
      iconURL: client?.user?.displayAvatarURL({ dynamic: true, size: 64 }),
    })
    .setTimestamp();
  return embed;
}

// ===== WARN EMBED =====
function warnEmbed({ targetUser, reason, totalWarnings, warningId, client }) {
  return baseEmbed(0xFEE75C, client)
    .setAuthor({
      name: 'Moderation Action',
      iconURL: client?.user?.displayAvatarURL({ dynamic: true, size: 128 }),
    })
    .setTitle(`${emojis.warn} Warning Issued`)
    .setDescription(
      `> ${targetUser} has been warned.\n\n` +
      `**${emojis.reason} Reason:** ${reason}\n` +
      `**${emojis.warnings} Total:** \`${totalWarnings}\``
    )
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({
      text: `Warning ID: #${warningId} ${emojis.dot} Powered by Dynamite Music`,
      iconURL: client?.user?.displayAvatarURL({ dynamic: true, size: 64 }),
    });
}

// ===== WARN DM EMBED =====
function warnDMEmbed({ guild, reason, totalWarnings, warningId, customMessage, client }) {
  const desc = (customMessage || 'You have received a warning in {guild}. Reason: {reason}')
    .replace('{guild}', guild.name)
    .replace('{reason}', reason);

  return baseEmbed(0xFEE75C)
    .setAuthor({
      name: `Warning from ${guild.name}`,
      iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client?.user?.displayAvatarURL({ dynamic: true, size: 128 }),
    })
    .setTitle(`${emojis.warn} You Have Been Warned`)
    .setDescription(desc)
    .addFields(
      { name: `${emojis.warnings} Total`, value: `\`${totalWarnings}\``, inline: true },
      { name: `${emojis.info} ID`, value: `\`#${warningId}\``, inline: true }
    )
    .setFooter({ text: 'Powered by Dynamite Music' });
}

// ===== SUCCESS EMBED =====
function successEmbed(title, description, client) {
  return baseEmbed(0x57F287, client)
    .setTitle(`${emojis.success} ${title}`)
    .setDescription(description);
}

// ===== ERROR EMBED =====
function errorEmbed(title, description, client) {
  return baseEmbed(0xED4245, client)
    .setTitle(`${emojis.error} ${title}`)
    .setDescription(description);
}

// ===== INFO EMBED =====
function infoEmbed(title, description, client) {
  return baseEmbed(0x5865F2, client)
    .setTitle(`${emojis.info} ${title}`)
    .setDescription(description);
}

// ===== MOD ACTION EMBED (for ban/kick/mute) =====
function modActionEmbed({ action, emoji, color, targetUser, reason, extraFields = [], client }) {
  const fields = [
    { name: `${emojis.reason} Reason`, value: reason, inline: false },
    ...extraFields,
  ];

  return baseEmbed(color, client)
    .setAuthor({
      name: 'Moderation Action',
      iconURL: client?.user?.displayAvatarURL({ dynamic: true, size: 128 }),
    })
    .setTitle(`${emoji} ${action}`)
    .setDescription(`> **${targetUser.tag}** has been ${action.toLowerCase()}.`)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(...fields);
}

module.exports = {
  baseEmbed,
  warnEmbed,
  warnDMEmbed,
  successEmbed,
  errorEmbed,
  infoEmbed,
  modActionEmbed,
};
