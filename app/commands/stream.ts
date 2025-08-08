import {type Store} from "../types";
import {createBulkString, createError} from "../utils/Encoder.ts";

export const streamCommands ={
    XADD : (store : Store, args : string[]) : string=> {
        if (args.length < 4) {
            return createError("wrong number of arguments for 'xadd' command");
        }
        const [key , ...entry] = args;
        const entryId = store.xadd(key, entry);

     return createBulkString(entryId);
    }
}