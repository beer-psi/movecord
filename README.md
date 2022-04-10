<h1 align="center">movecord</h1>

<p align="center">
  <a href="https://github.com/oceanroleplay/discord.ts">
    <img src="https://img.shields.io/badge/library-discord.ts-blue" alt="Library: discord.ts">
  </a>
</p>

<p align="center">Move messages between channels, and even between Discord servers.</p>

Simple bot to clone messages from one Discord server/channel to another. It has one slash command, `/clone`, which takes 2/3 arguments: source channel ID, destination channel ID, and the source guild ID (if cloning from external server).

To clone messages from another server, the bot has to be invited into both servers.

## Difference with other cloners
There are already other tools for this like [discord-transfer](https://github.com/BilliAlpha/discord-transfer) and [PoisnCopy](https://github.com/PoisnFang/PoisnCopy), but they both used embeds, which had annoying downsides like every message being an embed, and embeds not being preserved. This bot tries to solve that by utilizing webhooks instead, which can send embeds, set avatar and even username.

However, webhooks have a fairly low rate limit (30 requests/minute), and so it could take a while to transfer everything over. Timestamps are also not preserved.
