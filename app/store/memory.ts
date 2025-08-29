import { type RedisValue, type Store, type transactionState} from "./interface.ts";

import { StringStore } from './string';
import { ListStore } from './list';
import { StreamStore } from './stream';


export class MemoryStore implements Store {

    private stringStore = new StringStore();
    private listStore = new ListStore();
    private streamStore = new StreamStore();

    get(key: string, transactionState:transactionState): string | null {
        return this.stringStore.get(key, transactionState);
    }

    set(key: string, value: string, transactionState:transactionState,ttl?: number): string| void {
       return  this.stringStore.set(key, value, transactionState,ttl);
    }

    remove(key: string): void {
        this.stringStore.remove(key);
        this.listStore.remove(key);
        this.streamStore.remove(key);
    }

    rpush(key: string, values: string[]): number {
        return this.listStore.rpush(key, values);
    }

    lpush(key: string, elements: string[]): number {
        return this.listStore.lpush(key, elements);
    }

    lrange(key: string, start: number, end: number): string[] {
        return this.listStore.lrange(key, start, end);
    }

    llen(key: string): number {
        return this.listStore.llen(key);
    }

    lpop(key: string, count?: number): string[] | null {
        return this.listStore.lpop(key, count);
    }

    async blpop(key: string, timeoutMs: number): Promise<string[] | null> {
        return this.listStore.blpop(key, timeoutMs);
    }

    type(key: string,transactionState:transactionState): string | null {
        if (this.stringStore.get(key, transactionState)) return 'string';
        if (this.listStore.llen(key) > 0) return 'list';
        if (this.streamStore.getLastStreamId(key)) return 'stream';
        return null;
    }

    xadd(key: string, id: string, fields: [string, string][]): string {
        return this.streamStore.xadd(key, id, fields);
    }

    xrange(key: string, start: string, end: string): [string, string[]][] {
        return this.streamStore.xrange(key, start, end);
    }

    xread(keys: string[], startIds: string[]): [string, [string, string[]][]][] {
        return this.streamStore.xread(keys, startIds);
    }

    xreadBlocking(keys: string[], startIds: string[], blockMS: number): Promise<[string, [string, string[]][]][] | null> {
        return this.streamStore.xreadBlocking(keys, startIds, blockMS);
    }

    incr(key: string, by: number = 1, transactionState:transactionState): string|number {
        return this.stringStore.incr(key, by, transactionState);
    }
    multi(transactionState:transactionState){
        transactionState.inTransaction = true;
        transactionState.transactionQueue = [];
    }
    exec(transactionState:transactionState): (RedisValue|null|void|Error)[]{
        if (!transactionState.inTransaction) throw new Error('EXEC without MULTI')
        transactionState.inTransaction = false;
        const results: (RedisValue | null | void | Error)[] = [];


        for (const fn of transactionState.transactionQueue) {
            try {
                const result = fn();
                results.push(result);
            } catch (err) {
                results.push(err instanceof Error ? err : new Error(String(err)));
            }
        }

        transactionState.transactionQueue = [];
        return results;
    }
    discard(transactionState: transactionState) {
        if (!transactionState.inTransaction) throw new Error('DISCARD without MULTI')
        transactionState.inTransaction = false;
        transactionState.transactionQueue = [];
    }
}
