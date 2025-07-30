import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
 const server: net.Server = net.createServer((connection: net.Socket) => {
   connection.setEncoding('utf8');
   // Handle connection
   connection.on('data', (data : Buffer)=>{
     console.log(`Received data from  redis client :${data}`);
     const message: String = redisParser(data)
      if (message) {
          connection.write(JSON.stringify(message));
      }else {
          connection.write('+PONG\r\n')
      }
   })
  connection.on('end', ()=>{
    console.log('Client disconnected');
  })
 });

 const redisParser  = (command : Buffer) : String=>{

     let cmd_arr : String[] = command.toString().split('\r\n');
     cmd_arr = cmd_arr.filter((_, index) => index % 2 !== 0);
     let message:String ='';
     if(cmd_arr.length > 0 && cmd_arr[0].toUpperCase() == 'ECHO'){
         for(let i = 1; i < cmd_arr.length; i++){
             const bytes = cmd_arr[i].length;
             message += `$${bytes}\r\n${cmd_arr[i]}\r\n`;
         }
     }
     return message
 }
 server.listen(6379, "127.0.0.1");
