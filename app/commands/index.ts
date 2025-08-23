import { type Store, type CommandHandler } from '../store/interface.ts';
import { encodeError } from '../protocol/encoder';
import { genericCommandHandlers } from './generic';
import { stringCommandHandlers } from './string';
import { listCommandHandlers } from './list';
import { streamCommandHandlers } from './stream';
import {transactionCommandHandlers} from "./transaction.ts";

export class CommandExecutor {
    private commandMap: Record<string, CommandHandler> = {
        ...genericCommandHandlers,
        ...stringCommandHandlers,
        ...listCommandHandlers,
        ...streamCommandHandlers,
        ...transactionCommandHandlers
    };

    async execute(command: string, store: Store, args: string[]): Promise<string> {
        const cmd = command.toUpperCase();
        const handler = this.commandMap[cmd];
        if (!handler) return encodeError(`command '${cmd}' not supported`);
        return handler(store, args);
    }
}