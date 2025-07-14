import { BotCommand, BotEvent } from '../../types/BotTypes';

export abstract class BaseModule {
  constructor(public readonly name: string) {}
  public event: BotEvent[] = [];
  public commands: BotCommand[] = [];

  protected registerEvent(event: BotEvent): void {
    this.event.push(event);
  }
  protected registerCommand(command: BotCommand): void {
    this.commands.push(command);
  }
}
