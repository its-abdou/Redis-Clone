import { type Store, type CommandHandler } from '../types';
import { genericCommands } from './generic';
import { stringCommands } from './string';
import { createError } from '../utils/Encoder.ts';
import {listCommands} from "./list.ts";

const commandMap: Record<string, CommandHandler> = {
    ...genericCommands,
    ...stringCommands,
    ...listCommands

};

export const executeCommand = (command: string, store: Store, args: string[]): string => {
    const cmd = command.toUpperCase();
    const handler = commandMap[cmd];

    if (!handler) {
        return createError('command not supported!');
    }

    try {
        return handler(store, args);
    } catch (error) {
        return createError('internal server error');
    }
};