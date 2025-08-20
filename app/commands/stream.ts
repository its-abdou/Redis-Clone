import {type Store} from "../store/interface.ts";
import {encodeArray, encodeBulkString, encodeError, encodeStream} from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const streamCommandHandlers = {
    XADD: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 3) return encodeError(createArgCountError('xadd'));
        const [key, id, ...fieldValuePairs] = args;
        if (fieldValuePairs.length % 2 !== 0) return encodeError('invalid field-value pairs');
        const fields: [string, string][] = [];
        for (let i = 0; i < fieldValuePairs.length; i += 2) {
            fields.push([fieldValuePairs[i], fieldValuePairs[i + 1]]);
        }
        try {
            const streamId = store.xadd(key, id, fields);
            return encodeBulkString(streamId);
        } catch (err) {
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    },
    XRANGE: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 3) return encodeError(createArgCountError('xrange'));
        const [key , startId, endId] = args;
        try {
            const elements = store.xrange(key, startId, endId)
            return encodeStream(elements)
        }catch (err) {
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    },
    XREAD: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 3) return encodeError(createArgCountError('xrange'));
        let keys: string[] = [];
        let startIds : string[] = [];
        for (let i=1 ; i<args.length; i++){
            if(i<(args.length/2)) keys.push(args[i]);
            else startIds.push(args[i]);
        }
        try {
            const elements = store.xread(keys, startIds)
            let response = `*${elements.length}\r\n`
            for (const [streamName , entriesArray] of elements) {
                response+= `*2\r\n`;
                response += encodeBulkString(streamName);
                response += encodeStream(entriesArray);
            }
            return response;
        }catch (err) {
            return encodeError(err instanceof Error ? err.message : String(err));
        }
    }
};