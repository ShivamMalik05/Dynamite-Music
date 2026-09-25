const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

const configPath = path.join(__dirname, '..', 'config', 'logs.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.error('Failed to load logs config:', err.message);
    return null;
  }
}

function saveConfig(config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  fs.writeFileSync(configPath, content);
}

async function sendLog(client, type, data) {
  try {
    const config = loadConfig();
    if (!config) return;

    if (!config.enabled[type]) return;

    const channelId = config.channels[type];
    if (!channelId) return;

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      console.error(`Log channel not found for ${type}: ${channelId}`);
      return;
    }

    const container = new ContainerBuilder()
      .setAccentColor(data.color || config.colors[type] || 0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${data.emoji || '📋'} ${data.title}\n` +
          `**${data.subtitle || 'Log Event'}**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

    for (const field of data.fields || []) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${field.name}**\n${field.value}`
        )
      );
    }

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `*Powered by ${client.user.username} • <t:${Math.floor(Date.now() / 1000)}:R>*`
      )
    );

    await channel.send({ components: [container], flags: 1 << 15 });
  } catch (error) {
    console.error(`Failed to send log to ${type}:`, error.message);
  }
}

function isIgnored(config, { channelId, roleIds, userId }) {
  if (!config) return false;
  if (channelId && config.ignoredChannels.includes(channelId)) return true;
  if (userId && config.ignoredUsers.includes(userId)) return true;
  if (roleIds && roleIds.some(r => config.ignoredRoles.includes(r))) return true;
  return false;
}

module.exports = { sendLog, loadConfig, saveConfig, isIgnored };
