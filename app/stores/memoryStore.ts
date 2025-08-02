import {type Store, type StoredValue} from "../types";

export default class MemoryStore implements Store {
    private store: Record<string, StoredValue> = {};
    private waiters: Map<string, (value: string[] | null) => void> = new Map();
    private _notifyWaiter(key: string) {
        const waiter = this.waiters.get(key);
        if (waiter) {
            const value = this.lpop(key);
            if (value && value.length > 0) {
                waiter([key, ...value]);
            }
            this.waiters.delete(key);
        }
    }

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
        this._notifyWaiter(key);
        return this.store[key].value.length as number;
    }


    lpush(key: string, elements: string[] ): number {
        const list :StoredValue = this.store[key];

        if (list && list.type === "list") {
            const array = elements.reverse();
            (this.store[key].value as string[]).unshift(...array);
        }else {
            this.store[key] = {
                type : "list",
                value : elements,
                expiresAt : undefined,
            }
        }
        this._notifyWaiter(key);
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
    llen(key:string):number{
        const list  = this.store[key];
        if (list && list.type === "list") {

            return (list.value as string[]).length;
        }else {
            return 0
        }
    }
    lpop(key: string, count?: string): string[] | null {
        const list = this.store[key];
        if (list && list.type === "list") {
            const values = list.value as string[];
            const numToPop = count ? Number(count) : 1;

            if (isNaN(numToPop) || numToPop < 1) return [];

            const removedItems: string[] = [];

            for (let i = 0; i < numToPop && values.length > 0; i++) {
                const item = values.shift();
                if (item !== undefined) {
                    removedItems.push(item);
                }
            }

            return removedItems;
        } else {
            return null;
        }
    }
    async blpop(key: string, delay: number): Promise<string[] | null> {
        const result = this.lpop(key);
        if (result && result.length > 0) return result;

        return new Promise((resolve) => {
            let timer :Timer | null = null;
            if (delay>0) {
                timer = setTimeout(() => {
                    this.waiters.delete(key);  // Clean up
                    resolve(null);  // Timed out
                }, delay);
            }
            // Store the resolve function
            this.waiters.set(key, (value) => {
                if (timer) clearTimeout();
                resolve(value);
            });
        });

    }

}