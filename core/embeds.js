const { EmbedBuilder } = require('discord.js');
const config = require('./config');

module.exports = {
  base(color = config.colors.primary) {
    const embed = new EmbedBuilder().setColor(color);
    if (config.embed.showTimestamp) embed.setTimestamp();
    if (config.embed.footerText) embed.setFooter({ text: config.embed.footerText });
    return embed;
  },

  success(description, title) {
    const embed = this.base(config.colors.success);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },

  error(description, title) {
    const embed = this.base(config.colors.error);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },

  warning(description, title) {
    const embed = this.base(config.colors.warning);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },

  info(description, title) {
    const embed = this.base(config.colors.info);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },

  custom(color, description, title) {
    const embed = this.base(color);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },
};
