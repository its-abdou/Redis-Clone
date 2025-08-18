import {type Store, type StoredValue} from "./interface.ts";

export default class Memory implements Store {
    private store: Record<string, StoredValue> = {};
    private waiters: Map<string, (value: string[] | null) => void> = new Map();
    private _notifyWaiter(key: string) {
        const waiter = this.waiters.get(key);
        if (waiter) {
            const value = this.lpop(key);
            console.log('Notify waiter with:', [key, ...value ?? []]);
            if (value && value.length > 0) {
                waiter([key, ...value]);
            }
            this.waiters.delete(key);
        }
    }
    private _getLastStreamId(key: string): string | null {
        const item = this.store[key];
        if (!item || item.type !=='stream' || item.value.length === 0) {
            return null;
        }
        return item.value[item.value.length - 1].id;
    }

    private _validateStreamId(key : string, providedId: string) {

            const parts = providedId.split('-');
            if (parts.length !== 2) {
                throw new Error('Stream ID must be in timestamp-sequence format');
            }
            const [timestampStr, sequenceStr] = parts;
            const timestamp = Number(timestampStr);
            const sequence = Number(sequenceStr);
            if (isNaN(timestamp) || isNaN(sequence)) {
                throw new Error('Timestamp and sequence number must be numeric');
            }
            if (timestamp == 0 && sequence == 0) {
                throw new Error('The ID specified in XADD must be greater than 0-0');
            }
            const lastStreamId = this._getLastStreamId(key);
            if (lastStreamId) {
                const [lastStreamTimestampStr, lastStreamSequenceStr] = lastStreamId.split('-');
                const lastStreamTimestamp = Number(lastStreamTimestampStr);
                const lastStreamSequence = Number(lastStreamSequenceStr);

                if ((timestamp==lastStreamTimestamp && sequence==lastStreamSequence) || (timestamp<lastStreamTimestamp)) {
                    throw new Error('The ID specified in XADD is equal or smaller than the target stream top item');
                }
            }
            return providedId;
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

    rpush(key: string, values: string[] ): number {
        const list :StoredValue = this.store[key];

        if (list && list.type === "list") {
            (this.store[key].value as string[]).push(...values);
        }else {
            this.store[key] = {
                type : "list",
                value : values,
                expiresAt : undefined,
            }
        }
        const updatedItem = this.store[key] as StoredValue & { type: 'list' };
        const length = updatedItem.value.length;

        this._notifyWaiter(key);
        return length;
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
        const updatedItem = this.store[key] as StoredValue & { type: 'list' };
        const length = updatedItem.value.length;

        this._notifyWaiter(key);
        return length;
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
        if (result && result.length > 0) {
            return [key, ...result];
        }

        return new Promise((resolve) => {
            let timer :Timer | null = null;
            if (delay>0) {
                timer = setTimeout(() => {
                    this.waiters.delete(key);
                    resolve(null);
                }, delay);
            }
            // Store the resolve function
            this.waiters.set(key, (value) => {
                if (timer) clearTimeout(timer);
                resolve(value);
            });
        });
    }
    xadd(key: string, entry: string[]): string {
        const stream  = this.store[key];
        let entryId : string = entry[0];
        try {
            let keys : string[] = entry.filter((element, index:number) => index > 0 && index % 2 === 0);
            let values : string[] = entry.filter((element, index) => index > 0 && index % 2 === 1);

            const fields = new Map<string, string>();
            keys.forEach((key, index) => {
                fields.set(key, values[index]);
            })

            const id = this._validateStreamId(key,entryId)
            if(stream && stream.type === "stream") {
                stream.value.push({id , fields})
            }else {
                this.store[key] = {
                    type : 'stream',
                    value : [{id , fields}],
                }
            }
            return entryId;
        }catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message);
            }
            throw new Error(String(err));
        }
    }

    type(key: string): string | null {
        const item = this.store[key];
        if (!item) return null;
        return item.type;
    }

}