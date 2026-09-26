const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
} = require('discord.js');

const configPath = path.join(__dirname, '..', 'config', 'logs.js');

// ===== LOG QUEUE (prevent spam crash) =====
const logQueue = [];
let processing = false;

// ===== CONFIG MANAGEMENT =====
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
  try {
    const existing = loadConfig() || {};
    const merged = {
      channels: { ...(existing.channels || {}), ...(config.channels || {}) },
      enabled: { ...(existing.enabled || {}), ...(config.enabled || {}) },
      colors: { ...(existing.colors || {}), ...(config.colors || {}) },
      ignoredChannels: config.ignoredChannels || existing.ignoredChannels || [],
      ignoredRoles: config.ignoredRoles || existing.ignoredRoles || [],
      ignoredUsers: config.ignoredUsers || existing.ignoredUsers || [],
    };
    const content = `module.exports = ${JSON.stringify(merged, null, 2)};\n`;
    fs.writeFileSync(configPath, content);
    return true;
  } catch (err) {
    console.error('[logger] Failed to save config:', err.message);
    return false;
  }
}

// ===== SEPARATOR =====
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

// ===== GET CHANNEL (cache + fetch + retry) =====
async function getChannel(client, channelId) {
  // Try cache
  let channel = client.channels.cache.get(channelId);
  if (channel) return channel;

  // Try fetch with retry
  for (let i = 0; i < 3; i++) {
    try {
      channel = await client.channels.fetch(channelId);
      if (channel) return channel;
    } catch (err) {
      console.error(`[logger] Fetch attempt ${i + 1} failed:`, err.message);
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  return null;
}

// ===== CHECK PERMISSIONS =====
function checkPermissions(channel, client) {
  if (!channel || !channel.guild) return true; // DM or unknown
  try {
    const permissions = channel.permissionsFor(client.user);
    if (!permissions) return false;
    return permissions.has('SendMessages') && permissions.has('ViewChannel');
  } catch {
    return true; // Assume ok if can't check
  }
}

// ===== BUILD CONTAINER =====
function buildContainer(data, config, type, client) {
  const container = new ContainerBuilder()
    .setAccentColor(data.color || config.colors?.[type] || 0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${data.emoji || '📋'} ${data.title || 'Log Event'}\n` +
        `**${data.subtitle || 'Log Event'}**`
      )
    )
    .addSeparatorComponents(makeSep());

  for (const field of data.fields || []) {
    if (!field.name || !field.value) continue;
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

  return container;
}

// ===== SEND LOG (with retry + fallback) =====
async function sendLogNow(client, type, data) {
  const config = loadConfig();
  if (!config) {
    console.error('[logger] Config not loaded');
    return { success: false, error: 'Config not loaded' };
  }

  if (!config.enabled?.[type]) {
    return { success: false, error: 'Log type disabled' };
  }

  const channelId = config.channels?.[type];
  if (!channelId) {
    return { success: false, error: 'No channel set' };
  }

  const channel = await getChannel(client, channelId);
  if (!channel) {
    console.error(`[logger] Channel not found: ${channelId}`);
    return { success: false, error: 'Channel not found' };
  }

  if (!checkPermissions(channel, client)) {
    console.error(`[logger] No permission to send in: ${channelId}`);
    return { success: false, error: 'No permission' };
  }

  const container = buildContainer(data, config, type, client);

  // Try send with retry
  for (let i = 0; i < 3; i++) {
    try {
      const msg = await channel.send({
        components: [container],
        flags: 1 << 15,
      });
      return { success: true, messageId: msg.id };
    } catch (err) {
      console.error(`[logger] Send attempt ${i + 1} failed:`, err.message);
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { success: false, error: 'All send attempts failed' };
}

// ===== QUEUE PROCESSOR =====
async function processQueue(client) {
  if (processing) return;
  if (logQueue.length === 0) return;

  processing = true;

  while (logQueue.length > 0) {
    const job = logQueue.shift();
    try {
      const result = await sendLogNow(job.client, job.type, job.data);
      if (job.resolve) job.resolve(result);
    } catch (err) {
      console.error('[logger] Queue error:', err.message);
      if (job.resolve) job.resolve({ success: false, error: err.message });
    }
  }

  processing = false;
}

// ===== PUBLIC: sendLog =====
async function sendLog(client, type, data) {
  return new Promise((resolve) => {
    logQueue.push({ client, type, data, resolve });
    processQueue(client);
  });
}

// ===== IGNORE CHECK =====
function isIgnored(config, { channelId, roleIds, userId }) {
  if (!config) return false;
  if (channelId && config.ignoredChannels?.includes(channelId)) return true;
  if (userId && config.ignoredUsers?.includes(userId)) return true;
  if (roleIds && roleIds.some(r => config.ignoredRoles?.includes(r))) return true;
  return false;
}

// ===== TEST LOG =====
async function testLog(client, type) {
  return await sendLog(client, type, {
    emoji: '🧪',
    title: 'Test Log',
    subtitle: 'Testing log system',
    fields: [
      { name: 'Status', value: '✅ Working' },
      { name: 'Type', value: type },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
    ],
  });
}

module.exports = {
  sendLog,
  testLog,
  loadConfig,
  saveConfig,
  isIgnored,
};
