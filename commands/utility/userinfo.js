const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Show user information',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show user information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get info about')
        .setRequired(false)
    ),

  async execute(context) {
    let user, member;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      user = context.options.getUser('user') || context.user;
      member = await context.guild.members.fetch(user.id);
    } else {
      user = context.mentions.users.first() || context.author;
      member = context.guild.members.cache.get(user.id);
    }

    const embed = {
      color: 0x9B59B6,
      title: `User: ${user.tag}`,
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
        { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
        { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' },
      ],
    };

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply({ embeds: [embed] });
    } else {
      context.reply({ embeds: [embed] });
    }
  },
};
