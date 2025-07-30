import * as net from "net";
import {handleRedisCommand} from "./lib/utils/RedisParser.ts";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
 const server: net.Server = net.createServer((connection: net.Socket) => {
   connection.setEncoding('utf8');
   // Handle connection
   connection.on('data', (data : string)=>{
     console.log(`Received data from  redis client :${data}`);
        try {
          const response = handleRedisCommand(data)
          connection.write(response);
        }catch(err){
            connection.write('-ERR invalid command\r\n');
        }
   })
  connection.on('end', ()=>{
    console.log('Client disconnected');
  })
 });

server.listen(6379, "127.0.0.1");