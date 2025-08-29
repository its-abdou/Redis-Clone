import * as net from 'net';
import { parseRedisProtocol } from './protocol/parser';
import { MemoryStore } from './store/memory';
import type {transactionState} from "./store/interface.ts";

const store = new MemoryStore();
const clientTransactionStates = new Map<net.Socket, transactionState>();

console.log('Logs from your program will appear here!');

const server: net.Server = net.createServer((connection: net.Socket) => {
    connection.setEncoding('utf8');
    clientTransactionStates.set(connection, { inTransaction: false, transactionQueue: [] });

    connection.on('data', async (data: string) => {


        try {
            const response = await parseRedisProtocol(data, store, clientTransactionStates.get(connection)!);


            connection.write(response);

        } catch (err) {
            const errorResponse = '-ERR invalid command\r\n';
            connection.write(errorResponse);
        }
    });

    connection.on('end', () => {
        clientTransactionStates.delete(connection)
        console.log('Client disconnected');
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
    });
});

server.listen(6379, '127.0.0.1', () => {
    console.log('Redis server listening on 127.0.0.1:6379');
});