const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const configPath = path.join(__dirname, '..', 'config', 'logs.js');

// ===== LOG QUEUE =====
const logQueue = [];
let processing = false;

// ===== CONFIG =====
function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    // Ensure defaults
    if (!config.channels) config.channels = {};
    if (!config.enabled) config.enabled = {};
    if (!config.colors) config.colors = {};
    if (!config.ignoredChannels) config.ignoredChannels = [];
    if (!config.ignoredRoles) config.ignoredRoles = [];
    if (!config.ignoredUsers) config.ignoredUsers = [];
    return config;
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
      format: config.format ?? existing.format ?? 'detailed',
      filters: { ...(existing.filters || {}), ...(config.filters || {}) },
      roleRouting: { ...(existing.roleRouting || {}), ...(config.roleRouting || {}) },
      priority: { ...(existing.priority || {}), ...(config.priority || {}) },
      autoArchive: { ...(existing.autoArchive || {}), ...(config.autoArchive || {}) },
      reactions: { ...(existing.reactions || {}), ...(config.reactions || {}) },
      timeBased: { ...(existing.timeBased || {}), ...(config.timeBased || {}) },
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

// ===== CHANNEL FETCH =====
async function getChannel(client, channelId) {
  let channel = client.channels.cache.get(channelId);
  if (channel) return channel;
  for (let i = 0; i < 3; i++) {
    try {
      channel = await client.channels.fetch(channelId);
      if (channel) return channel;
    } catch (err) {
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

// ===== TIME CHECK =====
function isWithinActiveHours(config) {
  if (!config.timeBased?.enabled) return true;
  const hours = config.timeBased.activeHours || [0, 24];
  const now = new Date();
  const hour = now.getHours();
  return hour >= hours[0] && hour < hours[1];
}

// ===== SMART FILTERS =====
function passesSmartFilters(data, config) {
  const filters = config.filters || {};
  if (!filters.messageContainsLink && !filters.messageContainsMention && !filters.messageContainsAttachment) return true;

  const content = (data.fields || []).map(f => f.value).join(' ');

  if (filters.messageContainsLink && !/https?:\/\//.test(content)) return false;
  if (filters.messageContainsMention && !/<@!?\d+>/.test(content)) return false;
  if (filters.messageContainsAttachment && !/attachment|file|image|video/i.test(content)) return false;

  return true;
}

// ===== ROLE-BASED ROUTING =====
async function getTargetChannelId(client, data, config, type) {
  // Check role routing
  if (config.roleRouting?.enabled && data.userId) {
    try {
      const guild = client.guilds.cache.first();
      const member = await guild.members.fetch(data.userId).catch(() => null);
      if (member) {
        for (const [roleId, channelId] of Object.entries(config.roleRouting)) {
          if (roleId === 'enabled') continue;
          if (member.roles.cache.has(roleId)) return channelId;
        }
      }
    } catch {}
  }
  return config.channels[type];
}

// ===== BUILD CONTAINER =====
function buildContainer(data, config, type, client) {
  const format = config.format || 'detailed';

  const container = new ContainerBuilder()
    .setAccentColor(data.color || config.colors?.[type] || 0xFFFFFF);

  if (format === 'minimal') {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${data.emoji || '📋'} ${data.title}`)
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${data.emoji || '📋'} ${data.title}\n` +
        `**${data.subtitle || 'Log Event'}**`
      )
    );
  }

  container.addSeparatorComponents(makeSep());

  if (format === 'compact') {
    const compactText = (data.fields || []).map(f => `**${f.name}:** ${f.value}`).join(' • ');
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(compactText));
  } else {
    for (const field of data.fields || []) {
      if (!field.name || !field.value) continue;
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${field.name}**\n${field.value}`)
      );
    }
  }

  container.addSeparatorComponents(makeSep());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `*Powered by ${client.user.username} • <t:${Math.floor(Date.now() / 1000)}:R>*`
    )
  );

  return container;
}

// ===== BUILD ACTION ROW =====
function buildReactionRow(config, logId) {
  if (!config.reactions?.enabled) return null;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`log_ignore_${logId}`).setEmoji(config.reactions.emojis?.ignore || '✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`log_review_${logId}`).setEmoji(config.reactions.emojis?.review || '⚠️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`log_important_${logId}`).setEmoji(config.reactions.emojis?.important || '⭐').setStyle(ButtonStyle.Primary)
  );
  return row;
}

// ===== SEND LOG =====
async function sendLogNow(client, type, data) {
  const config = loadConfig();
  if (!config) return { success: false, error: 'Config not loaded' };
  if (!config.enabled?.[type]) return { success: false, error: 'Log type disabled' };

  // Smart filters
  if (!passesSmartFilters(data, config)) {
    return { success: false, error: 'Filtered out' };
  }

  // Time-based
  if (!isWithinActiveHours(config)) {
    return { success: false, error: 'Outside active hours' };
  }

  // Get channel with role routing
  const channelId = await getTargetChannelId(client, data, config, type);
  if (!channelId) return { success: false, error: 'No channel set' };

  const channel = await getChannel(client, channelId);
  if (!channel) return { success: false, error: 'Channel not found' };

  const container = buildContainer(data, config, type, client);
  const logId = Date.now().toString(36);

  const payload = {
    components: [container],
    flags: 1 << 15,
  };

  // Add reaction buttons
  const reactionRow = buildReactionRow(config, logId);
  if (reactionRow) {
    payload.components.push(reactionRow);
  }

  // Try send with retry
  for (let i = 0; i < 3; i++) {
    try {
      const msg = await channel.send(payload);
      return { success: true, messageId: msg.id };
    } catch (err) {
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { success: false, error: 'Send failed' };
}

// ===== QUEUE =====
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
      if (job.resolve) job.resolve({ success: false, error: err.message });
    }
  }
  processing = false;
}

async function sendLog(client, type, data) {
  return new Promise((resolve) => {
    logQueue.push({ client, type, data, resolve });
    processQueue(client);
  });
}

// ===== IGNORE =====
function isIgnored(config, { channelId, roleIds, userId }) {
  if (!config) return false;
  if (channelId && config.ignoredChannels?.includes(channelId)) return true;
  if (userId && config.ignoredUsers?.includes(userId)) return true;
  if (roleIds && roleIds.some(r => config.ignoredRoles?.includes(r))) return true;
  return false;
}

module.exports = {
  sendLog,
  loadConfig,
  saveConfig,
  isIgnored,
  makeSep,
  getChannel,
};
