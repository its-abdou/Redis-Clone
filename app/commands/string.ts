import { type Store } from '../store/interface.ts';
import { encodeError, encodeBulkString, encodeNullBulkString, encodeSimpleString } from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const stringCommandHandlers = {
    GET: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('get'));
        const value = store.get(args[0]);
        return value ? encodeBulkString(value) : encodeNullBulkString();
    },
    SET: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 2) return encodeError(createArgCountError('set'));
        const [key, value, option, ttl] = args;
        if (option && option.toUpperCase() === 'PX') {
            if (!ttl) return encodeError(createArgCountError('set'));
            store.set(key, value, Number(ttl));
        } else {
            store.set(key, value);
        }
        return encodeSimpleString();
    },
};