const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const {
  isOwner,
  addOwner,
  removeOwner,
  getAllOwners,
} = require('../../utils/owners');

module.exports = {
  name: 'owner',
  description: 'Manage bot owners (owner only)',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Manage bot owners')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user as bot owner')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to add as owner')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a user from bot owners')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to remove')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all bot owners')),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /owner (slash command).');
    }

    if (!isOwner(context.user.id)) {
      return context.reply({
        content: `${emojis.error} Only bot owners can use this command.`,
        ephemeral: true
      });
    }

    const sub = context.options.getSubcommand();

    // ===== ADD =====
    if (sub === 'add') {
      const user = context.options.getUser('user');

      if (isOwner(user.id)) {
        return context.reply({
          content: `${emojis.error} **${user.tag}** is already an owner.`,
          ephemeral: true
        });
      }

      addOwner(user.id);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setAuthor({
          name: 'Bot Owner Added',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.success} Owner Added`)
        .setDescription(`**${user.tag}** is now a bot owner.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👤 User', value: `${user} (${user.tag})`, inline: true },
          { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
          { name: '👑 Added By', value: context.user.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: 'Powered by Dynamite Music',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 64 })
        });

      return context.reply({ embeds: [embed] });
    }

    // ===== REMOVE =====
    if (sub === 'remove') {
      const user = context.options.getUser('user');

      const owners = getAllOwners();
      if (owners.length === 1 && owners[0] === user.id) {
        return context.reply({
          content: `${emojis.error} Cannot remove the last owner.`,
          ephemeral: true
        });
      }

      if (!isOwner(user.id)) {
        return context.reply({
          content: `${emojis.error} **${user.tag}** is not an owner.`,
          ephemeral: true
        });
      }

      removeOwner(user.id);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setAuthor({
          name: 'Bot Owner Removed',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.cancel} Owner Removed`)
        .setDescription(`**${user.tag}** is no longer a bot owner.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👤 User', value: `${user} (${user.tag})`, inline: true },
          { name: '👑 Removed By', value: context.user.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: 'Powered by Dynamite Music',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 64 })
        });

      return context.reply({ embeds: [embed] });
    }

    // ===== LIST =====
    if (sub === 'list') {
      const owners = getAllOwners();

      const list = [];
      for (const id of owners) {
        try {
          const user = await context.client.users.fetch(id);
          list.push(`${emojis.dot} **${user.tag}** — \`${id}\``);
        } catch {
          list.push(`${emojis.dot} Unknown User — \`${id}\``);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setAuthor({
          name: 'Bot Owners',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.star} Owner List`)
        .setDescription(
          `**Total Owners:** ${owners.length}\n\n` +
          (list.length > 0 ? list.join('\n') : '*No owners*')
        )
        .setTimestamp()
        .setFooter({
          text: 'Powered by Dynamite Music',
          iconURL: context.client.user.displayAvatarURL({ dynamic: true, size: 64 })
        });

      return context.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
