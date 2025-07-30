import Store from "../../stores/store.ts";

export const handleCommand = (args : string[] , store :Store): string => {

    const command = args[0].toUpperCase();

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
            store.set(args[1], args[2]);
            return '+OK\r\n'
        case 'GET':
            if (args.length < 2) {
                return '-ERR wrong number of arguments for \'get\' command\r\n';
            }
            const value =  store.get(args[1]);
            console.log(value)
            if(!value){
                return '-ERR no key found\r\n';
            }
            return `$${value.length}\r\n${value}\r\n`;
        default:
            return  '-ERR command not supported!\r\n';
    }
}