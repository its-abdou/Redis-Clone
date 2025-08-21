import {type Store} from "./interface.ts";

import { StringStore } from './string';
import { ListStore } from './list';
import { StreamStore } from './stream';

export class MemoryStore implements Store {
    private stringStore = new StringStore();
    private listStore = new ListStore();
    private streamStore = new StreamStore();

    get(key: string): string | null {
        return this.stringStore.get(key);
    }

    set(key: string, value: string, ttl?: number): void {
        this.stringStore.set(key, value, ttl);
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

    type(key: string): string | null {
        if (this.stringStore.get(key)) return 'string';
        if (this.listStore.llen(key) > 0) return 'list';
        if (this.streamStore.getLastStreamId(key)) return 'stream';
        return null;
    }
}