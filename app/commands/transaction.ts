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

    MULTI: async (store: Store): Promise<string> => {
        store.multi();
        return encodeSimpleString();
    },
    EXEC: async (store: Store): Promise<string> => {
        try {
            const results = store.exec();

            // Encode the array of results
            const encodedResults = results.map(result => {
                if (typeof result === 'number') return encodeInteger(result);
                if (typeof result === 'string') return encodeBulkString(result);
                if (result === null) return encodeNullBulkString();
                if (Array.isArray(result)) {
                    return encodeArray(result.map(item => encodeBulkString(String(item))));
                }
                return encodeSimpleString('OK');
            });

            return encodeArray(encodedResults);

        }catch (err){
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    }
}