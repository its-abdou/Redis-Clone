import { type Store } from '../types';
import {
    createArray,
    createBulkString,
    createError,
    createInteger,
    createNullArray,
    createNullBulkString
} from "../utils/Encoder.ts";
export  const listCommands = {
    RPUSH : (store: Store, args: string[]) : string =>{
        if (args.length < 2) {
            return createError("wrong number of arguments for 'rpush' command");
        }
        const [key, ...value] = args;
       const nb_elements = store.rpush(key, value);
       return `:${nb_elements}\r\n`;
    },

    LPUSH : (store: Store, args: string[]) : string =>{
        if (args.length < 2) {
            return createError("wrong number of arguments for 'lpush' command");
        }
        const [key, ...value] = args;
        const nb_elements = store.lpush(key, value);
        return `:${nb_elements}\r\n`;
    },
    LRANGE : (store: Store, args: string[]): string => {
        if (args.length < 3) {
            return createError("wrong number of arguments for 'lrange' command");
        }
        const [key, ...value] = args;
        const elements = store.lrange(key, value);
        if (elements.length <=0) {
            return createNullArray();
        }
        return createArray(elements) ;
    },
    LLEN: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'llen' command");
        }
        const value = store.llen(args[0]);
        return createInteger(value);
    },
    LPOP: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'lpop' command");
        }
        const value = store.lpop(args[0]);
        if (!value) {
            return createNullBulkString();
        }else if (value.length < 2) {
            return createBulkString(value[0])
        }

        return  createArray(value)
    }

}