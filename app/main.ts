import * as net from 'net';
import { parseRedisProtocol } from './protocol/parser';
import { MemoryStore } from './store/memory';

const store = new MemoryStore();

console.log('Logs from your program will appear here!');

const server: net.Server = net.createServer((connection: net.Socket) => {
    connection.setEncoding('utf8');

    connection.on('data', async (data: string) => {
        try {
            const response = await parseRedisProtocol(data, store);

            connection.write(response);
        } catch (err) {
            console.error('Error processing command:', err);
            connection.write('-ERR invalid command\r\n');
        }
    });

    connection.on('end', () => {
        console.log('Client disconnected');
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
    });
});

server.listen(6379, '127.0.0.1', () => {
    console.log('Redis server listening on 127.0.0.1:6379');
});
