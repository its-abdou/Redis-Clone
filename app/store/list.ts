import {type StoredValue} from "./interface.ts";

export class ListStore {
    private data: Record<string, StoredValue & { type: 'list' }> = {};
    private waiters: Map<string, Array<(value: string[] | null) => void>> = new Map();

    private notifyWaiter(key: string): void {
        const waitersForKey = this.waiters.get(key);
        if (waitersForKey && waitersForKey.length>0) {
            const waiter = waitersForKey.shift()!;
            if (waitersForKey.length === 0) this.waiters.delete(key);

            const value = this.lpop(key);
            if (value?.length) {
                waiter([key, ...value]);
            } else {
                waiter(null);
            }
            this.waiters.delete(key);
        }

    }

    rpush(key: string, values: string[]): number {
        let list = this.data[key];
        if (!list || list.type !== 'list') {
            list = { type: 'list', value: [] };
            this.data[key] = list;
        }
        list.value.push(...values);
        const listItemsNum = list.value.length
        this.notifyWaiter(key);
        return listItemsNum;
    }

    lpush(key: string, elements: string[]): number {
        let list = this.data[key];
        if (!list || list.type !== 'list') {
            list = { type: 'list', value: [] };
            this.data[key] = list;
        }
        list.value.unshift(...elements.reverse());
        const listItemsNum = list.value.length
        this.notifyWaiter(key);
        return listItemsNum;
    }

    lrange(key: string, start: number, end: number): string[] {
        const list = this.data[key];
        if (!list || list.type !== 'list') return [];
        const length = list.value.length;
        if (length === 0) return [];

        // Convert negative indices to positive
        let startIndex = start < 0 ? Math.max(0, length + start) : start;
        let endIndex = end < 0 ? Math.max(-1, length + end) : end;

        // Clamp indices to valid range
        startIndex = Math.max(0, Math.min(startIndex, length - 1));
        endIndex = Math.max(-1, Math.min(endIndex, length - 1));

        // If start > end, return empty array
        if (startIndex > endIndex) return [];

        // slice() expects end index to be exclusive, so add 1
        return list.value.slice(startIndex, endIndex + 1);
    }

    llen(key: string): number {
        const list = this.data[key];
        return list && list.type === 'list' ? list.value.length : 0;
    }

    lpop(key: string, count = 1): string[] | null {
        const list = this.data[key];
        if (!list || list.type !== 'list' || list.value.length === 0) return null;

        const numToPop = Math.max(1, count);
        const removedItems: string[] = list.value.splice(0, numToPop);
        if (list.value.length === 0) delete this.data[key];
        return removedItems;
    }

    async blpop(key: string, timeoutMs: number): Promise<string[] | null> {


        const result = this.lpop(key);
        if (result?.length) {

            return [key, ...result];
        }



        return new Promise((resolve) => {
            const timer = timeoutMs > 0 ? setTimeout(() => {


                // Remove this specific waiter from the array
                const waitersForKey = this.waiters.get(key);
                if (waitersForKey) {
                    const index = waitersForKey.indexOf(waiterCallback);
                    if (index > -1) {
                        waitersForKey.splice(index, 1);

                    }
                    // Clean up empty waiter arrays
                    if (waitersForKey.length === 0) {
                        this.waiters.delete(key);

                    }
                }
                resolve(null);
            }, timeoutMs) : null;

            // Add this waiter to the array for this key
            if (!this.waiters.has(key)) {
                this.waiters.set(key, []);
            }

            const waiterCallback = (value: string[] | null) => {

                if (timer) clearTimeout(timer);
                resolve(value);
            };

            this.waiters.get(key)!.push(waiterCallback);

        });
    }

    remove(key: string): void {
        delete this.data[key];
    }
}