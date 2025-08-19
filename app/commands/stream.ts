import {type Store} from "../store/interface.ts";
import { encodeBulkString, encodeError } from '../protocol/encoder';
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
};