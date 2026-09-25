const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

const configPath = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function sendLog(client, type, data) {
  const config = loadConfig();
  if (!config) return;
  if (!config.logging[type]) return;

  const channelId = config.logChannels[type];
  if (!channelId) return;

  const channel = client.channels.cache.get(channelId);
  if (!channel) return;

  const container = new ContainerBuilder()
    .setAccentColor(data.color || 0xFFFFFF)
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
      `*Powered by ${client.user.username}*`
    )
  );

  try {
    await channel.send({ components: [container], flags: 1 << 15 });
  } catch (error) {
    console.error(`Failed to send log to ${type}:`, error);
  }
}

function isIgnored(config, { channelId, roleIds, userId }) {
  if (!config) return false;
  if (channelId && config.ignoredChannels.includes(channelId)) return true;
  if (userId && config.ignoredUsers.includes(userId)) return true;
  if (roleIds && config.ignoredRoles.some(r => roleIds.includes(r))) return true;
  return false;
}

module.exports = { sendLog, loadConfig, saveConfig, isIgnored };
