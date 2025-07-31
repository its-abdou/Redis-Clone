import { type Store } from '../types';
import {createArray, createBulkString, createError, createNullArray, createNullBulkString} from "../utils/Encoder.ts";
export  const listCommands = {
    RPUSH : (store: Store, args: string[]) : string =>{
        if (args.length < 2) {
            return createError("wrong number of arguments for 'rpush' command");
        }
        const [key, ...value] = args;
       const nb_elements = store.rpush(key, value);
       return `:${nb_elements}\r\n`;
    },
    LRANGE : (store: Store, args: string[]) => {
        if (args.length < 3) {
            return createError("wrong number of arguments for 'rpush' command");
        }
        const [key, ...value] = args;
        const elements = store.lrange(key, value);
        if (elements.length <=0) {
            return createNullArray();
        }
        return createArray(elements) ;
    }

}