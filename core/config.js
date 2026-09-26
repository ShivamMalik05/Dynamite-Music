const fs = require('fs');
const path = require('path');

const logsPath = path.join(__dirname, '..', 'config', 'logs.js');
const warningsPath = path.join(__dirname, '..', 'config', 'warnings.js');
const permissionsPath = path.join(__dirname, '..', 'config', 'permissions.js');
const ownersPath = path.join(__dirname, '..', 'config', 'owners.js');
const emojisPath = path.join(__dirname, '..', 'config', 'emojis.js');

// ===== GENERIC LOAD =====
function loadConfig(filePath, defaults = {}) {
  try {
    delete require.cache[require.resolve(filePath)];
    const config = require(filePath);
    return { ...defaults, ...config };
  } catch {
    return defaults;
  }
}

// ===== GENERIC SAVE =====
function saveConfig(filePath, config) {
  try {
    const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
    fs.writeFileSync(filePath, content);
    return true;
  } catch {
    return false;
  }
}

// ===== LOGS CONFIG =====
function loadLogs() {
  return loadConfig(logsPath, {
    channels: {},
    enabled: {},
    colors: {},
    format: 'detailed',
  });
}

function saveLogs(config) {
  return saveConfig(logsPath, config);
}

// ===== WARNINGS CONFIG =====
function loadWarnings() {
  return loadConfig(warningsPath, {
    rules: [],
    autoDelete: { enabled: false, days: 30 },
    decay: { enabled: false, days: 7, factor: 0.5 },
    notify: { enabled: false },
    silentMode: false,
    customDM: {},
  });
}

function saveWarnings(config) {
  return saveConfig(warningsPath, config);
}

// ===== PERMISSIONS CONFIG =====
function loadPermissions() {
  return loadConfig(permissionsPath, {
    global: { whitelistMode: false, allowedUserIds: [], allowedRoleIds: [], blockedUserIds: [], blockedRoleIds: [] },
    servers: {},
    commands: {},
  });
}

function savePermissions(config) {
  return saveConfig(permissionsPath, config);
}

// ===== OWNERS CONFIG =====
function loadOwners() {
  return loadConfig(ownersPath, { owners: [] });
}

function saveOwners(config) {
  return saveConfig(ownersPath, config);
}

// ===== EMOJIS CONFIG =====
function loadEmojis() {
  return loadConfig(emojisPath, {});
}

module.exports = {
  loadConfig,
  saveConfig,
  loadLogs,
  saveLogs,
  loadWarnings,
  saveWarnings,
  loadPermissions,
  savePermissions,
  loadOwners,
  saveOwners,
  loadEmojis,
};
