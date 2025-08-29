import { type Store,type transactionState } from '../store/interface.ts';
import { encodeError, encodeBulkString, encodeNullBulkString, encodeSimpleString , encodeInteger } from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const stringCommandHandlers = {
    GET: async (store: Store, args: string[], transactionState:transactionState): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('get'));
        const value = store.get(args[0], transactionState);
        if(value==="QUEUED") return encodeSimpleString("QUEUED");
        return value ? encodeBulkString(value) : encodeNullBulkString();
    },
    SET: async (store: Store, args: string[], transactionState:transactionState): Promise<string> => {
        if (args.length < 2) return encodeError(createArgCountError('set'));
        const [key, value, option, ttl] = args;
        let result :string|void;
        if (option && option.toUpperCase() === 'PX') {
            if (!ttl) return encodeError(createArgCountError('set'));
            result= store.set(key, value,  transactionState, Number(ttl));
        } else {
           result =store.set(key, value , transactionState);
        }

        if (result === "QUEUED") return encodeSimpleString("QUEUED");
        return encodeSimpleString();
    },
    INCR: async (store: Store, args: string[], transactionState:transactionState): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('incr'));
        const key = args[0];
        try {
            const response = store.incr(key,1,transactionState)
            if (typeof(response) === 'number') return encodeInteger(response);
            else return encodeSimpleString(response)
        }catch (err){
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    },
};