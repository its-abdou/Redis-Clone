import { type Store } from '../types';
import { createError, createSuccess, createBulkString } from '../utils/Encoder.ts';

export const stringCommands = {
    GET: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'get' command");
        }

        const value = store.get(args[0]);
        if (!value) {
            return createError('no key found');
        }

        return createBulkString(value);
    },

    SET: (store: Store, args: string[]): string => {
        if (args.length < 2) {
            return createError("wrong number of arguments for 'set' command");
        }

        store.set(args[0], args[1]);
        return createSuccess();
    }
};