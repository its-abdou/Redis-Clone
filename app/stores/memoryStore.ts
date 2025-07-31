import {type Store, type StoredValue} from "../types";

export default class MemoryStore implements Store {
    private store: Record<string, StoredValue> = {};

    get(key: string): string | null {
        const item : StoredValue = this.store[key];
        if(!item) return null;
        if(item.expiresAt && (item.expiresAt <= Date.now())) {
            this.remove(key);
            return null;
        }
        if (item.type !== 'string') {
            return null;
        }
        return item.value as string;
    }

    set(key: string, value: string , ttl?: number ): void {
        if (!ttl){
            this.store[key] = {
                type : "string",
                value : value,
                expiresAt : undefined,
            }
        }else {
            this.store[key] = {
                type : "string",
                value : value,
                expiresAt : Date.now() + ttl,
            }
        }
    }

    remove(key: string): void {
        delete this.store[key];
    }

    rpush(key: string, value: string[] ): number {
        const list :StoredValue = this.store[key];

        if (list && list.type === "list") {
            (this.store[key].value as string[]).push(...value);
        }else {
            this.store[key] = {
                type : "list",
                value : value,
                expiresAt : undefined,
            }
        }
        return this.store[key].value.length as number;
    }


    lpush(key: string, value: string[] ): number {
        const list :StoredValue = this.store[key];

        if (list && list.type === "list") {
            const array = (list.value as string[]).reverse();
            (this.store[key].value as string[]).unshift(...array);
        }else {
            this.store[key] = {
                type : "list",
                value : value,
                expiresAt : undefined,
            }
        }
        return this.store[key].value.length as number;
    }
    lrange(key: string, value: string[]): string[] {
        const list  = this.store[key];
        const [startIndex, endIndex] = value
        if (list && list.type === "list") {
            const array = list.value as string[];
         return (array).slice(Number(startIndex), (Number(endIndex)==-1?  array.length : Number(endIndex) +1));
        }else {
            return [];
        }
    }
}