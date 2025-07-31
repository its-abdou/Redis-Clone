import { type Store } from '../types';
import {createError} from "../utils/Encoder.ts";
export  const listCommands = {
    RPUSH : (store: Store, args: string[]) : string =>{
        if (args.length < 2) {
            return createError("wrong number of arguments for 'rpush' command");
        }
        const [key, value] = args;
       const nb_elements = store.rpush(key, value);
       return `:${nb_elements}\r\n`;
    }
}