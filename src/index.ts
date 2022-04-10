import { Intents } from "discord.js";
import { Client} from 'discordx';
import { dirname, importx } from "@discordx/importer";
import 'dotenv/config';


export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once("ready", async () => {
  await client.guilds.fetch();
  await client.initApplicationCommands();
  await client.initApplicationPermissions();
  console.log("Bot started");
})

client.on("interactionCreate", (interaction) => {
  client.executeInteraction(interaction);
});

async function run() {
  await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your env file. Create a .env file with BOT_TOKEN=your_bot_token");
  }
  await client.login(<string>process.env.BOT_TOKEN);
}

run();



