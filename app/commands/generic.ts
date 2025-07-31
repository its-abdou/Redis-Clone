import { type Store } from '../types';
import { createError, createSuccess, createBulkString } from '../utils/Encoder.ts';

export const genericCommands = {
    PING: (store: Store, args: string[]): string => {
        return createSuccess('PONG');
    },

    ECHO: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'echo' command");
        }
        return createBulkString([args[0]]);
    }
};