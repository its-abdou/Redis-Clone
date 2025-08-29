import {type Store, type transactionState} from "../store/interface.ts";
import {
    encodeArray,
    encodeBulkString,
    encodeError,
    encodeInteger,
    encodeNullBulkString, encodeSimpleString,
} from '../protocol/encoder';


export const transactionCommandHandlers = {
    MULTI: async (store: Store, args: string[], transactionState: transactionState): Promise<string> => {
        if (transactionState.inTransaction) {
            return encodeError('MULTI calls cannot be nested');
        }
        store.multi(transactionState);
        return encodeSimpleString();
    },
    EXEC: async (store: Store, args: string[], transactionState: transactionState): Promise<string> => {
        if (!transactionState.inTransaction) {
            return encodeError('EXEC without MULTI');
        }
        try {
            const results = store.exec(transactionState);
            const encodedResults = results.map(result => {
                try{
                if (typeof result === 'number') return result
                if (typeof result === 'string') return  result;
                if (result === null) return encodeNullBulkString();
                if (Array.isArray(result)) {
                    return encodeArray(result.map(item => encodeBulkString(String(item))));
                }
                return 'OK';}
                catch (err){
                    return encodeError(err instanceof Error ? err.message : String(err));
                }
            });
            return encodeArray(encodedResults);
        } catch (err) {
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    },
    DISCARD: async (store: Store, args: string[], transactionState: transactionState): Promise<string> => {
       try{
           store.discard(transactionState);
           return encodeSimpleString();
       }catch (err){
           return encodeError(err instanceof Error ? err.message : String(err));
       }

    },
};