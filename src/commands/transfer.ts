import { CommandInteraction, Message, AnyChannel, TextChannel, NewsChannel, Webhook, MessageManager } from "discord.js";
import {
  Discord,
  Slash,
  SlashOption,
} from "discordx";
import { client } from "../index.js";

@Discord()
class TransferCommands {
  @Slash("clone")
  async clone(
    @SlashOption("src", { description: 'Source channel' }) srcChanId: string,
    @SlashOption("dest", { description: 'Destination channel' }) destChanId: string,
    @SlashOption("src_guild", { description: 'Source guild ID', required: false }) srcGuild: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    if (!srcGuild && !interaction.guildId) {
      interaction.reply("You must specify a source guild ID");
      return;
    }
    const srcChan: AnyChannel | null = await client.channels.fetch(srcChanId);
    const destChan: AnyChannel | null = await client.channels.fetch(destChanId);
    srcGuild = srcGuild ?? interaction.guildId;
    if (srcChan === null || destChan === null) {
      interaction.reply("Invalid source or destination channel")
      return;
    }
    if (!srcChan.isText() || !destChan.isText()) {
      interaction.reply("Source and destination channels must be text channels");
      return;
    }
    await interaction.deferReply();
    await this.cloneTextChannel(<TextChannel>srcChan, <TextChannel>destChan, srcGuild);
    interaction.editReply("Initiated transfer.");
  }

  private async isThereWebhook(channel: TextChannel | NewsChannel): Promise<Webhook | boolean> {
    const webhooks = await channel.fetchWebhooks()
    for (const [_, webhook] of webhooks.entries()) {
      if (webhook.name === "movecord") {
        return webhook;
      }
    }
    return false;
  }

  private async createWebhookIfNotExist(channel: TextChannel | NewsChannel): Promise<Webhook> {
    let webhook: Webhook | boolean = await this.isThereWebhook(channel);
    if (!webhook) {
      webhook = await channel.createWebhook("movecord");
    }
    return <Webhook>webhook;
  }

  private async fetchMessages(channel: TextChannel | NewsChannel, guild?: string): Promise<Message[]> {
    const extChan = guild ? (await (await client.guilds.fetch({guild: guild})).channels.fetch(channel.id)) : undefined
    if (!extChan?.isText()) {
      throw Error("Channel is not a text channel");
    }
    const manager: MessageManager = guild ? extChan.messages : channel.messages;
    let messages: Message[] = [];
    let lastID: string | undefined;

    while (true) {
      const fetchedMessages = await manager.fetch({ 
        limit: 50, 
        ...(lastID && { before: lastID }) 
      })
      if (fetchedMessages.size === 0) {
        return messages.reverse();
      }
      messages = messages.concat(Array.from(fetchedMessages.values()))
      lastID = fetchedMessages.lastKey();
    }
  }

  private async cloneTextChannel(srcChan: TextChannel | NewsChannel, destChan: TextChannel | NewsChannel, srcGuild?: string) {
    console.log(`Initiating clone of ${srcChan.id} to ${destChan.id}`);
    // check if we already have a webhook in destChan
    let webhook: Webhook = await this.createWebhookIfNotExist(destChan)
    const messages = await this.fetchMessages(srcChan, srcGuild);
    messages.forEach(async message => {
      let payload: {[key: string]: any} = {
        content: message.content 
                 + (message.attachments.size < 1 ? '' : `\n${message.attachments.map(attachment => attachment.url).join("\n")}`)
                 + (message.embeds.length < 1 ? '' : `\n${message.embeds.map(embed => {
                    if (embed.toJSON().type !== "rich") {
                      return embed.url
                    }
                  }).join("\n")}`),
        embeds: message.embeds.map(embed => {
          if (embed.toJSON().type === "rich") {
            return embed
          }
        }),
        avatarURL: message.author.avatarURL() ?? undefined,
        username: message.author.username,
        tts: message.tts,
        components: message.components,
      }
      Object.keys(payload).forEach(key => {
        if (!payload[key] || payload[key].length < 1) {
          delete payload[key]
        }
      })
      if (payload.content || payload.embeds || payload.attachments) {
        webhook.send(payload);      
      }
    })
  }
}
