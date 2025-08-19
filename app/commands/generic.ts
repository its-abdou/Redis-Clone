import { type Store } from '../store/interface.ts';
import { encodeSimpleString, encodeError } from '../protocol/encoder';
import { createArgCountError } from '../utils/errors';

export const genericCommandHandlers = {
    PING: async (store: Store, args: string[]): Promise<string> => encodeSimpleString('PONG'),
    ECHO: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('echo'));
        return encodeSimpleString(args[0]);
    },
    TYPE: async (store: Store, args: string[]): Promise<string> => {
        if (args.length < 1) return encodeError(createArgCountError('type'));
        const type = store.type(args[0]);
        return encodeSimpleString(type ?? 'none');
    },
};