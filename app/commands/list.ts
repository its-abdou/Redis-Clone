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
        const [key, value] = args;
        const removedItems = store.lpop(key , value);
        console.log(removedItems)
        if (!removedItems) {

            return createNullBulkString();
        }else if (removedItems.length < 2) {
            return createBulkString(removedItems[0])
        }
        return  createArray(removedItems)
    },
    BLPOP: async (store: Store, args: string[]) : Promise<string> => {
        if (args.length < 2) {
            return createError("wrong number of arguments for 'blpop' command");
        }
        const [key, delay ] = args;
        const removedItems = await store.blpop(key, Number(delay));
        if (!removedItems) {
            return createNullBulkString();
        }
        console.log('BLPOP returned:', removedItems);

        return createArray(removedItems)
    }

}