const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
} = require('discord.js');

const configPath = path.join(__dirname, '..', 'config', 'logs.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.error('[logger] Failed to load config:', err.message);
    return null;
  }
}

function saveConfig(config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  fs.writeFileSync(configPath, content);
}

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

async function sendLog(client, type, data) {
  console.log(`[sendLog] Called — type: ${type}, title: ${data.title}`);
  
  try {
    const config = loadConfig();
    if (!config) {
      console.error('[sendLog] Config not loaded');
      return;
    }
    console.log(`[sendLog] Config loaded`);

    if (!config.enabled[type]) {
      console.log(`[sendLog] Type "${type}" is disabled`);
      return;
    }

    const channelId = config.channels[type];
    console.log(`[sendLog] Channel ID for "${type}": ${channelId}`);

    if (!channelId) {
      console.error(`[sendLog] No channel set for type: ${type}`);
      return;
    }

    // Try cache first
    let channel = client.channels.cache.get(channelId);
    console.log(`[sendLog] Channel from cache: ${channel ? `#${channel.name}` : 'NOT FOUND'}`);

    // If not in cache, fetch it
    if (!channel) {
      channel = await client.channels.fetch(channelId).catch((err) => {
        console.error(`[sendLog] Fetch failed for ${channelId}:`, err.message);
        return null;
      });
      console.log(`[sendLog] Channel after fetch: ${channel ? `#${channel.name}` : 'STILL NULL'}`);
    }

    if (!channel) {
      console.error(`[sendLog] Channel not found: ${channelId}`);
      return;
    }

    // Build container
    const container = new ContainerBuilder()
      .setAccentColor(data.color || config.colors[type] || 0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${data.emoji || '📋'} ${data.title}\n` +
          `**${data.subtitle || 'Log Event'}**`
        )
      )
      .addSeparatorComponents(makeSep());

    for (const field of data.fields || []) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${field.name}**\n${field.value}`
        )
      );
    }

    container.addSeparatorComponents(makeSep());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `*Powered by ${client.user.username} • <t:${Math.floor(Date.now() / 1000)}:R>*`
      )
    );

    console.log(`[sendLog] Sending to #${channel.name}...`);
    const msg = await channel.send({ components: [container], flags: 1 << 15 });
    console.log(`[sendLog] ✅ Message sent! ID: ${msg.id}`);
  } catch (error) {
    console.error(`[sendLog] ❌ Error:`, error.message);
    console.error(error.stack);
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
