const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'owners.js');

function loadOwners() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.error('Failed to load owners config:', err.message);
    return { owners: [] };
  }
}

function saveOwners(config) {
  const content = `// ============================================
// BOT OWNERS CONFIG
// Owners have FULL access to everything
// ============================================

module.exports = ${JSON.stringify(config, null, 2)};
`;
  fs.writeFileSync(configPath, content);
}

function isOwner(userId) {
  const config = loadOwners();
  return (config.owners || []).includes(userId);
}

function addOwner(userId) {
  const config = loadOwners();
  if (!config.owners) config.owners = [];
  if (config.owners.includes(userId)) return false;
  config.owners.push(userId);
  saveOwners(config);
  return true;
}

function removeOwner(userId) {
  const config = loadOwners();
  if (!config.owners) return false;
  const idx = config.owners.indexOf(userId);
  if (idx === -1) return false;
  config.owners.splice(idx, 1);
  saveOwners(config);
  return true;
}

function getAllOwners() {
  const config = loadOwners();
  return config.owners || [];
}

module.exports = {
  loadOwners,
  saveOwners,
  isOwner,
  addOwner,
  removeOwner,
  getAllOwners,
};
