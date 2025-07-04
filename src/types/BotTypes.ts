import {
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ClientOptions,
    SharedSlashCommand,
} from "discord.js";

export type Bot = {
    name: string,
    token: string,
    client_id: string
}

export type BotModule = {
    name: string,
    commands: BotCommand[],
    event: BotEvent[]
}

export type BotCommand = {
    slashCommand: SharedSlashCommand,
    execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>
}

export type BotEvent<K extends keyof ClientEvents = keyof ClientEvents> = {
    eventType: K;
    execute: (client: Client, ...args: any[K]) => Promise<void>;
    once: boolean;
};

export class BotClient extends Client {
  public modules: BotModule[] = [];

  constructor(options: ClientOptions) {
    super(options);
  }
}