const config = require('./config');

module.exports = {
  isOwner(userId) {
    return config.owners.includes(userId);
  },

  isAdmin(member) {
    if (!member) return false;
    if (this.isOwner(member.id)) return true;
    return member.permissions.has('Administrator');
  },

  isModerator(member) {
    if (!member) return false;
    if (this.isAdmin(member)) return true;
    return member.permissions.has([
      'KickMembers',
      'BanMembers',
      'ModerateMembers',
      'ManageMessages',
    ]);
  },

  isUser(member) {
    return !!member;
  },

  // Global permissions check
  isGloballyAllowed(userId, roleIds = []) {
    const g = config.permissions.global;
    if (g.whitelistMode) {
      if (g.allowedUserIds.length && !g.allowedUserIds.includes(userId)) return false;
      if (g.allowedRoleIds.length && !roleIds.some(r => g.allowedRoleIds.includes(r))) return false;
    }
    if (g.blockedUserIds.includes(userId)) return false;
    if (roleIds.some(r => g.blockedRoleIds.includes(r))) return false;
    return true;
  },

  getLevel(member) {
    if (this.isOwner(member.id)) return 'owner';
    if (this.isAdmin(member)) return 'admin';
    if (this.isModerator(member)) return 'moderator';
    return 'user';
  },
};
