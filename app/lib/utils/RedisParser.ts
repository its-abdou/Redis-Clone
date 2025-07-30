import Store from "../../stores/store.ts";
export  const handleRedisCommand = (command: string) : string => {
    const lines = command.split('\r\n');
    if(lines[0].startsWith('*')){

        return handleRESPCommand(lines);
    }
    return '+PONG\r\n';
}


const handleRESPCommand = (lines: string[]): string => {
    let args: string[] = [];
    for(let i = 1; i < lines.length; i+=2) {
        if(lines[i].startsWith('$') && lines[i+1]){
            args.push(lines[i+1]);
        }
    }
    const command = args[0].toUpperCase();
    let store = new Store();

    switch(command){

        case 'ECHO':
            if (args.length < 2) {
                return '-ERR wrong number of arguments for \'echo\' command\r\n';
            }
            const message = args[1];
            return `$${message.length}\r\n${message}\r\n`;
        case 'PING':
            return '+PONG\r\n';
        case 'SET':
            if (args.length < 3) {
                return '-ERR wrong number of arguments for \'set\' command\r\n';
            }
            store.set(args[2], args[3]);
            return '+OK\r\n'
        case 'GET':
            if (args.length < 2) {
                return '-ERR wrong number of arguments for \'get\' command\r\n';
            }
           const value =  store.get(args[2]);
            console.log(value)
                if(!value){
                    return '-ERR no key found\r\n';
                }
            return `$${value.length}\r\n${value}\r\n`;
        default:
            return  '-ERR command not supported!\r\n';
    }
}