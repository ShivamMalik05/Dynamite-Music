// ============================================
// APP EMOJIS LOADER
// Fetches emojis from Discord Developer Portal
// ============================================

async function fetchAppEmojis(client) {
  try {
    const appId = client.application.id;
    const botToken = process.env.DISCORD_TOKEN;

    const response = await fetch(
      `https://discord.com/api/v10/applications/${appId}/emojis`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('[appEmojis] Failed to fetch:', response.status);
      return {};
    }

    const data = await response.json();
    const emojiMap = {};

    for (const emoji of data.items) {
      emojiMap[emoji.name] = emoji.animated
        ? `<a:${emoji.name}:${emoji.id}>`
        : `<:${emoji.name}:${emoji.id}>`;
    }

    console.log(`[appEmojis] Loaded ${Object.keys(emojiMap).length} emojis:`, Object.keys(emojiMap).join(', '));
    return emojiMap;
  } catch (err) {
    console.error('[appEmojis] Error:', err.message);
    return {};
  }
}

module.exports = { fetchAppEmojis };
