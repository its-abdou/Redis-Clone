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
        return item.value;
    }

    set(key: string, value: string , ttl?: number ): void {
        if (!ttl){
            this.store[key] = {
                value : value,
                expiresAt : undefined,
            }
        }else {
            this.store[key] = {
                value : value,
                expiresAt : Date.now() + ttl,
            }
        }
    }

    remove(key: string): void {
        delete this.store[key];
    }
}