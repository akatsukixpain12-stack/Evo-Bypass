const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "";
const permissions = process.env.NEXT_PUBLIC_DISCORD_PERMISSIONS ?? "8";
const scopes = process.env.NEXT_PUBLIC_DISCORD_SCOPES ?? "bot applications.commands";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Evo Bypass",
  discordClientId: clientId,
  discordInviteUrl: clientId
    ? "https://discord.com/oauth2/authorize?client_id=" + clientId + "&permissions=" + permissions + "&scope=" + encodeURIComponent(scopes)
    : "#",
  hasDiscordInvite: Boolean(clientId),
  supportServerUrl: process.env.NEXT_PUBLIC_DISCORD_SUPPORT_URL ?? "#"
};
