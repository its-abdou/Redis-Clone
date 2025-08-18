import {type Store} from "../store/interface.ts";
import {createBulkString, createError} from "../protocol/Encoder.ts";

export const streamCommands ={
    XADD : (store : Store, args : string[]) : string=> {

        if (args.length < 3) {
            return createError("wrong number of arguments for 'xadd' command");
        }

        const [key, ...entry] = args;
        try {
            const entryId = store.xadd(key, entry);
            return createBulkString(entryId);
        }catch(err){
            if (err instanceof Error) {
                return createError(err.message);
            }
            return createError(String(err));
        }

    },

}