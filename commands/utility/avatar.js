const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
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
  name: 'avatar',
  description: 'Show user avatar',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show user avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User (defaults to you)')
        .setRequired(false)),

  async execute(context) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let user, member;

    if (isSlash) {
      user = context.options.getUser('user') || context.user;
      member = await context.guild.members.fetch(user.id).catch(() => null);
    } else {
      user = context.mentions.users.first() || context.author;
      member = await context.guild.members.fetch(user.id).catch(() => null);
    }

    const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const serverAvatar = member?.displayAvatarURL({ dynamic: true, size: 1024 });
    const isDifferent = globalAvatar !== serverAvatar;

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.person} ${user.username}\n` +
          `**Avatar Information**`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emojis.dot} **User:** ${user.tag}\n` +
          `${emojis.dot} **ID:** \`${user.id}\``
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emojis.person} Global Avatar**`)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(globalAvatar)
        )
      );

    if (isDifferent) {
      container.addSeparatorComponents(makeSep());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emojis.person} Server Avatar**`)
      );
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(serverAvatar)
        )
      );
    }

    container.addSeparatorComponents(makeSep());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Global Avatar')
        .setEmoji('🖼️')
        .setURL(globalAvatar)
        .setStyle(ButtonStyle.Link)
    );

    if (isDifferent) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel('Server Avatar')
          .setEmoji('🖼️')
          .setURL(serverAvatar)
          .setStyle(ButtonStyle.Link)
      );
    }

    await context.reply({
      components: [container, row],
      flags: 1 << 15,
    });
  },
};
