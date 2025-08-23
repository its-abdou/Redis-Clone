import {type Store} from "../store/interface.ts";
import {
    encodeArray,
    encodeBulkString,
    encodeError,
    encodeInteger,
    encodeNullBulkString, encodeSimpleString,
} from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const transactionCommandHandlers = {
    INCR: async (store: Store, args: string[]): Promise<string> => {
            if (args.length < 1) return encodeError(createArgCountError('incr'));
            const key = args[0];
            try {
                return encodeInteger(store.incr(key,1))
            }catch (err){
                return encodeError(err instanceof Error ? err.message : String(err));
            }
    },
    MULTI: async (store: Store): Promise<string> => {
        return encodeSimpleString();
    },
    EXEC: async (store: Store): Promise<string> => {
        return encodeError('EXEC without MULTI')
    }
}