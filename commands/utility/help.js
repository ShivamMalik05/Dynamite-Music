const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
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

// ===== BUILD HELP PAGE =====
function buildHelpPage(client, categoryFilter = null) {
  const prefix = '!';

  // Group commands by category
  const categories = {};
  client.commands.forEach((command) => {
    const cat = command.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(command);
  });

  // Sort commands inside each category
  for (const cat of Object.keys(categories)) {
    categories[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Category order
  const categoryOrder = ['Moderation', 'Utility', 'Fun', 'Other'];
  const sortedCategories = Object.keys(categories).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  // Filter if needed
  const displayCategories = categoryFilter
    ? sortedCategories.filter(c => c.toLowerCase() === categoryFilter.toLowerCase())
    : sortedCategories;

  // Category emojis
  const catEmojis = {
    Moderation: '🛡️',
    Utility: '🔧',
    Fun: '🎉',
    Other: '📁',
  };

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} ${client.user.username} Help\n` +
        `**Prefix:** \`${prefix}\` • **Slash:** \`/\`\n` +
        `**Total Commands:** \`${client.commands.size}\``
      )
    )
    .addSeparatorComponents(makeSep());

  for (const category of displayCategories) {
    const catEmoji = catEmojis[category] || '📁';
    const commands = categories[category];

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${catEmoji} ${category} (${commands.length})`
      )
    );

    for (const cmd of commands) {
      const aliases = cmd.aliases?.length ? ` *(${cmd.aliases.join(', ')})*` : '';
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`${prefix}${cmd.name}\` • \`/${cmd.name}\`${aliases}\n` +
          `└ ${cmd.description || 'No description'}`
        )
      );
    }

    container.addSeparatorComponents(makeSep());
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Tips:**\n` +
      `• Use \`${prefix}help <command>\` for details\n` +
      `• Slash commands have autocomplete\n` +
      `• Prefix commands are faster\n\n` +
      `*Powered by Dynamite Music*`
    )
  );

  return container;
}

// ===== BUILD CATEGORY DROPDOWN =====
function buildCategoryDropdown(client) {
  const categories = new Set();
  client.commands.forEach(cmd => {
    categories.add(cmd.category || 'Other');
  });

  const catEmojis = {
    Moderation: '🛡️',
    Utility: '🔧',
    Fun: '🎉',
    Other: '📁',
  };

  const options = Array.from(categories).sort().map(cat => ({
    label: cat,
    value: cat.toLowerCase(),
    emoji: catEmojis[cat] || '📁',
    description: `View ${cat} commands`,
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('help_category')
    .setPlaceholder('📋 Select a category')
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

// ===== BUILD NAV BUTTONS =====
function buildNavButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_all')
      .setLabel('All Commands')
      .setEmoji('📚')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );
  return [row];
}

module.exports = {
  name: 'help',
  description: 'Show all available commands',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get details about a specific command')
        .setRequired(false)),

  async execute(context, args) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let commandName, client;

    if (isSlash) {
      commandName = context.options.getString('command');
      client = context.client;
    } else {
      // Delete command message
      setTimeout(() => context.delete().catch(() => {}), 500);

      commandName = args[0];
      client = context.client;
    }

    // ===== COMMAND DETAIL VIEW =====
    if (commandName) {
      const cmd = client.commands.get(commandName.toLowerCase());
      if (!cmd) {
        const msg = await context.reply(`${emojis.error} Command \`${commandName}\` not found.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }

      const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${emojis.info} \`${cmd.name}\`\n` +
            `**${cmd.description || 'No description'}**`
          )
        )
        .addSeparatorComponents(makeSep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Category:** ${cmd.category || 'Other'}\n` +
            `**Prefix:** \`!${cmd.name}\`\n` +
            `**Slash:** \`/${cmd.name}\`\n` +
            (cmd.aliases?.length ? `**Aliases:** \`${cmd.aliases.join('`, `')}\`\n` : '')
          )
        )
        .addSeparatorComponents(makeSep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Usage:**\n` +
            `\`!${cmd.name} ${cmd.usage || ''}\`\n` +
            `\`/${cmd.name}\``
          )
        )
        .addSeparatorComponents(makeSep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_all')
          .setLabel('All Commands')
          .setEmoji('📚')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_close')
          .setLabel('Close')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Danger)
      );

      if (isSlash) {
        await context.reply({ components: [container, row], flags: 1 << 15 });
      } else {
        const sentMsg = await context.reply({ components: [container, row], flags: 1 << 15 });
        setTimeout(() => sentMsg.delete().catch(() => {}), 30000);
      }
      return;
    }

    // ===== MAIN HELP VIEW =====
    const container = buildHelpPage(client);

    if (isSlash) {
      await context.reply({
        components: [
          container,
          ...buildCategoryDropdown(client),
          ...buildNavButtons(),
        ],
        flags: 1 << 15,
      });
    } else {
      const sentMsg = await context.reply({
        components: [
          container,
          ...buildCategoryDropdown(client),
          ...buildNavButtons(),
        ],
        flags: 1 << 15,
      });
      setTimeout(() => sentMsg.delete().catch(() => {}), 60000);
    }
  },

  // ===== HANDLE BUTTONS =====
  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('help_')) return false;

    if (id === 'help_close') {
      await interaction.update({ components: [] });
      return true;
    }

    if (id === 'help_all') {
      const container = buildHelpPage(client);
      await interaction.update({
        components: [
          container,
          ...buildCategoryDropdown(client),
          ...buildNavButtons(),
        ],
        flags: 1 << 15,
      });
      return true;
    }

    return false;
  },

  // ===== HANDLE SELECT =====
  async handleSelect(interaction, client) {
    const id = interaction.customId;
    if (id !== 'help_category') return false;

    const category = interaction.values[0];
    const container = buildHelpPage(client, category);

    await interaction.update({
      components: [
        container,
        ...buildCategoryDropdown(client),
        ...buildNavButtons(),
      ],
      flags: 1 << 15,
    });
    return true;
  },
};
