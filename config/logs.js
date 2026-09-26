cd ~/Dynamite-Music
rm config/logs.js
cat > config/logs.js << 'EOF'
module.exports = {
  "channels": {
    "moderation": "1550404080856211555",
    "warn": "",
    "autoaction": "",
    "lock": "",
    "messages": "1550404080856211555",
    "members": "",
    "channels": "",
    "roles": "1550404080856211555",
    "voice": "1550404081040887843",
    "server": ""
  },
  "enabled": {
    "moderation": true,
    "warn": true,
    "autoaction": true,
    "lock": true,
    "messages": true,
    "members": true,
    "channels": true,
    "roles": true,
    "voice": true,
    "server": true
  },
  "colors": {
    "moderation": 15548997,
    "warn": 16705372,
    "autoaction": 16776960,
    "lock": 15105570,
    "messages": 16705372,
    "members": 5763719,
    "channels": 5793266,
    "roles": 15418782,
    "voice": 1752220,
    "server": 10181046
  },
  "ignoredChannels": [],
  "ignoredRoles": [],
  "ignoredUsers": []
};
EOF
