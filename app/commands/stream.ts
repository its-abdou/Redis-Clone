import {type Store} from "../store/interface.ts";
import {encodeArray, encodeBulkString, encodeError, encodeNullBulkString, encodeStream} from '../protocol/encoder';
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
        if (args.length < 3) return encodeError(createArgCountError('xread'));
        let argIndex = 0;
        let blockMS :number|undefined;
        if (args[argIndex].toLowerCase() === 'block') {
            if(argIndex+1> args.length) return  encodeError('1');
            blockMS = Number(args[argIndex+1]);
            if (blockMS<0 || isNaN(blockMS)) return  encodeError('2');
            argIndex+=2;
        }
        if (args[argIndex].toLowerCase() !== 'streams') return encodeError('3');

        argIndex++;
        const remainingArgs = args.slice(argIndex);
        if (remainingArgs.length % 2 !== 0) {
            return encodeError('ERR Unbalanced XREAD list of streams: for each stream key an ID or $ must be specified.');
        }
        const numStreams= remainingArgs.length/2;
        const keys: string[] = remainingArgs.slice(0, numStreams);
        const startIds : string[] = remainingArgs.slice(numStreams);

        try {
            let  elements: [string, [string, string[]][]][] | null;
            if (blockMS !== undefined) {
                // Use blocking version
                elements = await store.xreadBlocking(keys, startIds, blockMS);
            } else {
                // Use non-blocking version
                elements = store.xread(keys, startIds);
            }
            if (!elements || elements.length < 1) {
                return encodeNullBulkString()
            }
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