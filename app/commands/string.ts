import { type Store } from '../types';
import {createError, createSuccess, createBulkString, createNullBulkString} from '../utils/Encoder.ts';

export const stringCommands = {
    GET: (store: Store, args: string[]): string => {
        if (args.length < 1) {
            return createError("wrong number of arguments for 'get' command");
        }

        const value = store.get(args[0]);
        if (!value) {
            return createNullBulkString();
        }

        return createBulkString([value]);
    },

    SET: (store: Store, args: string[]): string => {
        if (args.length < 2) {
            return createError("wrong number of arguments for 'set' command");
        }
      const [key, value ,...options] = args;
        if (options.length < 1) {
            store.set(key, value);
        }else {
           const option = options[0].toUpperCase();
           const ttl  = options[1];

           switch (option) {
               case 'PX':
                   if(!ttl){
                       return createError("wrong number of arguments for 'set' command");
                   }
                   store.set(key, value,  Number(ttl));
           }
        }
        return createSuccess();
    }
};