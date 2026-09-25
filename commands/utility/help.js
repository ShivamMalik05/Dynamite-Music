const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'help',
  description: 'Show all available commands',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(context) {
    const client = context.client;
    const prefix = '!';

    const categories = {};
    client.commands.forEach((command) => {
      const category = command.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(command);
    });

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.star} ${client.user.username} Help\n` +
          `**Prefix:** \`${prefix}\` | **Slash:** \`/\`\n` +
          `**Total Commands:** ${client.commands.size}`
        )
      );

    const sortedCategories = Object.keys(categories).sort();

    for (const category of sortedCategories) {
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

      const commands = categories[category].sort((a, b) => a.name.localeCompare(b.name));
      const list = commands
        .map(c => `\`${prefix}${c.name}\` — ${c.description || 'No description'}`)
        .join('\n');

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.arrowRight} ${category}**\n${list}`
        )
      );
    }

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by ${client.user.username}*`)
    );

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply({ components: [container], flags: 1 << 15 });
    } else {
      await context.reply({ components: [container], flags: 1 << 15 });
    }
  },
};
