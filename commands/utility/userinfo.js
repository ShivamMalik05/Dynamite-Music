const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'userinfo',
  description: 'Show user information',
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = {
      color: 0x0099ff,
      title: `${emojis.user} User: ${user.tag}`,
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
        { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
        { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' },
      ],
    };

    message.reply({ embeds: [embed] });
  },
};
