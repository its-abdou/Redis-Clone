import { type Store } from '../types';
import {createError, createSuccess, createBulkString, createString} from '../utils/Encoder.ts';

export const genericCommands = {
    PING: (store: Store, args: string[]): string => {
        return createSuccess('PONG');
    },

    ECHO: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'echo' command");
        }
        return createBulkString(args[0]);
    },
    TYPE:(store:Store , args:string[]): string =>{
        if (args.length < 1) {
            return createError("wrong number of arguments for 'type' command");
        }
        const key = args[0];
        const type = store.type(key);
        if (!type) {
            return createString('none')
        }
        return createString(type);
    }
};