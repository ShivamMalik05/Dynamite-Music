const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', 'data', 'warnings.json');

// ===== LOAD =====
function load() {
  if (!fs.existsSync(warningsPath)) return { nextId: 1, warnings: {} };
  try {
    const data = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    if (!data.warnings) data.warnings = {};
    if (!data.nextId) data.nextId = 1;
    return data;
  } catch {
    return { nextId: 1, warnings: {} };
  }
}

// ===== SAVE =====
function save(data) {
  const dir = path.dirname(warningsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

// ===== ADD WARNING =====
function addWarning(userId, reason, moderator, moderatorId) {
  const data = load();
  const id = data.nextId;
  data.nextId += 1;

  if (!data.warnings[userId]) data.warnings[userId] = [];

  data.warnings[userId].push({
    id,
    reason,
    moderator,
    moderatorId,
    date: new Date().toISOString(),
  });

  save(data);
  return { id, total: data.warnings[userId].length };
}

// ===== GET USER WARNINGS =====
function getUserWarnings(userId) {
  const data = load();
  return data.warnings[userId] || [];
}

// ===== GET ALL WARNINGS =====
function getAllWarnings(filterUserId = null) {
  const data = load();
  const all = [];
  for (const [userId, warnings] of Object.entries(data.warnings)) {
    if (filterUserId && userId !== filterUserId) continue;
    for (const w of warnings) {
      all.push({ ...w, userId });
    }
  }
  return all.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ===== REMOVE WARNINGS =====
function removeWarnings(userId, options = {}) {
  const data = load();
  const warnings = data.warnings[userId] || [];
  let removed = [];

  if (options.all) {
    removed = [...warnings];
    data.warnings[userId] = [];
  } else if (options.id !== undefined) {
    const idx = warnings.findIndex(w => w.id === options.id);
    if (idx === -1) return { removed: [], removedIds: [], error: 'Warning not found' };
    removed = [warnings[idx]];
    warnings.splice(idx, 1);
    data.warnings[userId] = warnings;
  } else if (options.count !== undefined) {
    if (options.count > warnings.length) return { removed: [], removedIds: [], error: 'Not enough warnings' };
    removed = warnings.slice(-options.count);
    warnings.splice(-options.count, options.count);
    data.warnings[userId] = warnings;
  } else if (options.range) {
    const match = options.range.match(/^(\d+)-(\d+)$/);
    if (!match) return { removed: [], removedIds: [], error: 'Invalid range' };
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    const toRemove = warnings.slice(start - 1, end);
    if (toRemove.length === 0) return { removed: [], removedIds: [], error: 'No warnings in range' };
    removed = toRemove;
    data.warnings[userId] = warnings.filter(w => !toRemove.includes(w));
  } else {
    return { removed: [], removedIds: [], error: 'No options provided' };
  }

  save(data);
  return { removed, removedIds: removed.map(w => `#${w.id}`), error: null };
}

// ===== REMOVE BY ID (all users) =====
function removeById(warningId) {
  const data = load();
  for (const [userId, warnings] of Object.entries(data.warnings)) {
    const idx = warnings.findIndex(w => w.id === warningId);
    if (idx !== -1) {
      const removed = warnings[idx];
      warnings.splice(idx, 1);
      save(data);
      return { removed, userId, error: null };
    }
  }
  return { removed: null, error: 'Warning not found' };
}

// ===== STATS =====
function getStats() {
  const data = load();
  let total = 0, users = 0, mostWarned = null, mostCount = 0;
  const mods = {};
  const reasons = {};

  for (const [userId, warnings] of Object.entries(data.warnings)) {
    if (warnings.length > 0) {
      total += warnings.length;
      users++;
      if (warnings.length > mostCount) {
        mostCount = warnings.length;
        mostWarned = userId;
      }
      for (const w of warnings) {
        mods[w.moderator] = (mods[w.moderator] || 0) + 1;
        reasons[w.reason] = (reasons[w.reason] || 0) + 1;
      }
    }
  }

  return { total, users, mostWarned, mostCount, moderators: mods, reasons };
}

// ===== SEARCH =====
function search(query, type = 'reason') {
  const all = getAllWarnings();
  if (type === 'reason') return all.filter(w => w.reason.toLowerCase().includes(query.toLowerCase()));
  if (type === 'user') return all.filter(w => w.userId === query);
  if (type === 'moderator') return all.filter(w => w.moderator === query || w.moderatorId === query);
  return [];
}

module.exports = {
  load,
  save,
  addWarning,
  getUserWarnings,
  getAllWarnings,
  removeWarnings,
  removeById,
  getStats,
  search,
};
