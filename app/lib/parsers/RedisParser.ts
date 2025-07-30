import Store from "../../stores/store.ts";
import {handleCommand} from "../Handlers/commandHanlder.ts";

export  const RedisParser = (command: string ,store :Store) : string => {
    const lines = command.split('\r\n');
    if(lines[0].startsWith('*')){

        let args: string[] = [];
        for(let i = 1; i < lines.length; i+=2) {
            if(lines[i].startsWith('$') && lines[i+1]){
                args.push(lines[i+1]);
            }
        }
        if (args.length === 0) return '-ERR empty command\r\n';
        return handleCommand(args, store);
    }
    return '+PONG\r\n';
}


