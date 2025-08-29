import { type Store } from '../store/interface';
import { encodeArray, encodeBulkString, encodeError, encodeInteger, encodeNullArray, encodeNullBulkString } from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const listCommandHandlers = {
    RPUSH: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 2) return encodeError(createArgCountError('rpush'));
        const [key, ...values] = args;
        const elementCount = store.rpush(key, values);
        return encodeInteger(elementCount);
    },
    LPUSH: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 2) return encodeError(createArgCountError('lpush'));
        const [key, ...elements] = args;
        const elementCount = store.lpush(key, elements);
        return encodeInteger(elementCount);
    },
    LRANGE: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 3) return encodeError(createArgCountError('lrange'));
        const [key, start, end] = args;
        const elements = store.lrange(key, Number(start), Number(end));

        return encodeArray(elements);
    },
    LLEN: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('llen'));
        const length = store.llen(args[0]);
        return encodeInteger(length);
    },
    LPOP: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('lpop'));
        const [key, countStr] = args;
        const removedItems = store.lpop(key, countStr ? Number(countStr) : undefined);
        if (!removedItems) return encodeNullBulkString();
        return removedItems.length === 1 ? encodeBulkString(removedItems[0]) : encodeArray(removedItems);
    },
    BLPOP: async (store: Store, args: string[]): Promise<string> => {


        if (args.length < 2) return encodeError(createArgCountError('blpop'));

        const [key, timeout] = args;

        const timeoutMs = Number(timeout) * 1000;

        const result = await store.blpop(key, timeoutMs);

        const response = result ? encodeArray(result) : encodeNullArray();


        return response;
    },
};