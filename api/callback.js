export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code not provided");

  const clientId = "1390626260056674366";
  const clientSecret = "hL-Ji669_YHUf7ICB91PazHBrBeU0_eA";
  const redirectUri = "https://restorecord-three.vercel.app/api/callback";

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("scope", "identify email");

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

  if (!userResponse.ok) return res.status(500).send("Failed to fetch user info");

  const userData = await userResponse.json();

  const webhookURL = "YOUR_WEBHOOK_URL";
  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `User Verified:\nUsername: ${userData.username}#${userData.discriminator}\nEmail: ${userData.email}\nID: ${userData.id}`
    }),
  }).catch(() => {});

  res.status(200).send("Verification complete. You can close this tab.");
}
