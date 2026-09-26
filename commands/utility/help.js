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

function getCategories(client) {
  const categories = {};
  client.commands.forEach((command) => {
    const cat = command.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(command);
  });
  for (const cat of Object.keys(categories)) {
    categories[cat].sort((a, b) => a.name.localeCompare(b.name));
  }
  return categories;
}

const CATEGORY_EMOJIS = {
  Moderation: emojis.mod,
  Utility: emojis.help,
  Fun: emojis.smile,
  Other: emojis.dot,
};

function buildIntroPage(client) {
  const categories = getCategories(client);
  const totalCommands = client.commands.size;
  const totalSlash = client.slashCommands?.size || 0;

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} ${client.user.username} Help\n` +
        `**Welcome to the help menu!**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} About**\n` +
        `This bot provides moderation, utility, and fun commands.\n` +
        `Use the dropdown below to browse commands.`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Statistics**\n` +
        `${emojis.arrow} **Total Commands:** \`${totalCommands}\`\n` +
        `${emojis.arrow} **Slash Commands:** \`${totalSlash}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.field || emojis.info} Categories**\n` +
        Object.keys(categories).sort().map(cat => {
          const emoji = CATEGORY_EMOJIS[cat] || emojis.dot;
          return `${emoji} **${cat}** — \`${categories[cat].length}\` command(s)`;
        }).join('\n')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} How to use:**\n` +
        `${emojis.dot} Select a category from the dropdown\n` +
        `${emojis.dot} Or use \`/help command:ban\` for details\n` +
        `${emojis.dot} Prefix: \`!help\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  return container;
}

function buildCategoryPage(client, category) {
  const categories = getCategories(client);
  const commands = categories[category] || [];
  const emoji = CATEGORY_EMOJIS[category] || emojis.dot;

  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emoji} ${category} Commands\n` +
        `**${commands.length} command(s) available**`
      )
    )
    .addSeparatorComponents(makeSep());

  for (const cmd of commands) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### \`${cmd.name}\`\n` +
        `**${cmd.description || 'No description'}**\n` +
        `└ Prefix: \`!${cmd.name}\`\n` +
        `└ Slash: \`/${cmd.name}\`` +
        (cmd.usage ? `\n└ Usage: \`!${cmd.name} ${cmd.usage}\`` : '')
      )
    );
    container.addSeparatorComponents(makeSep());
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
  );

  return container;
}

function buildAllPage(client) {
  const categories = getCategories(client);

  const container = new ContainerBuilder()
    .setAccentColor(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.message} All Commands\n` +
        `**${client.commands.size} total commands**`
      )
    )
    .addSeparatorComponents(makeSep());

  for (const category of Object.keys(categories).sort()) {
    const emoji = CATEGORY_EMOJIS[category] || emojis.dot;
    const commands = categories[category];

    let catText = `**${emoji} ${category}**\n`;
    for (const cmd of commands) {
      catText += `└ \`!${cmd.name}\` / \`/${cmd.name}\` — ${cmd.description || 'No description'}\n`;
    }

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(catText)
    );
    container.addSeparatorComponents(makeSep());
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
  );

  return container;
}

function buildDropdown(client) {
  const categories = getCategories(client);

  const options = [
    {
      label: 'All Commands',
      value: 'all',
      emoji: '📚',
      description: `View all ${client.commands.size} commands`,
    },
  ];

  for (const cat of Object.keys(categories).sort()) {
    options.push({
      label: cat,
      value: cat.toLowerCase(),
      description: `View ${categories[cat].length} ${cat} command(s)`,
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('help_menu')
    .setPlaceholder('📋 Select a category...')
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

function buildNavButtons(disabled = false) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_home')
      .setLabel('Home')
      .setEmoji('🏠')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('help_all')
      .setLabel('All Commands')
      .setEmoji('📚')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );
  return [row];
}

function buildFullView(client, viewType, category = null) {
  let container;
  let isIntro = false;

  if (viewType === 'intro') {
    container = buildIntroPage(client);
    isIntro = true;
  } else if (viewType === 'all') {
    container = buildAllPage(client);
  } else if (viewType === 'category' && category) {
    container = buildCategoryPage(client, category);
  } else {
    container = buildIntroPage(client);
    isIntro = true;
  }

  return [
    container,
    ...buildDropdown(client),
    ...buildNavButtons(isIntro),
  ];
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
      setTimeout(() => context.delete().catch(() => {}), 500);
      commandName = args[0];
      client = context.client;
    }

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
            (cmd.usage ? `**Usage:** \`!${cmd.name} ${cmd.usage}\`\n` : '')
          )
        )
        .addSeparatorComponents(makeSep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_home')
          .setLabel('Home')
          .setEmoji('🏠')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_close')
          .setLabel('Close')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Danger)
      );

      await context.reply({ components: [container, row], flags: 1 << 15 });
      return;
    }

    const components = buildFullView(client, 'intro');
    await context.reply({ components, flags: 1 << 15 });
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('help_')) return false;

    if (id === 'help_close') {
      try {
        await interaction.message.delete();
      } catch (err) {
        try {
          await interaction.update({ content: 'Help menu closed.', components: [], embeds: [] });
        } catch (err2) {
          console.error('Close fallback failed:', err2.message);
        }
      }
      return true;
    }

    if (id === 'help_home') {
      const components = buildFullView(client, 'intro');
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    if (id === 'help_all') {
      const components = buildFullView(client, 'all');
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    return false;
  },

  async handleSelect(interaction, client) {
    const id = interaction.customId;
    if (id !== 'help_menu') return false;

    const value = interaction.values[0];

    let components;
    if (value === 'all') {
      components = buildFullView(client, 'all');
    } else {
      const categories = getCategories(client);
      const realCat = Object.keys(categories).find(c => c.toLowerCase() === value);
      if (!realCat) {
        await interaction.reply({ content: `${emojis.error} Category not found.`, ephemeral: true });
        return true;
      }
      components = buildFullView(client, 'category', realCat);
    }

    await interaction.update({ components, flags: 1 << 15 });
    return true;
  },
};
