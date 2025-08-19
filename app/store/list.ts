import {type StoredValue} from "./interface.ts";

export class ListStore {
    private data: Record<string, StoredValue & { type: 'list' }> = {};
    private waiters: Map<string, (value: string[] | null) => void> = new Map();

    private notifyWaiter(key: string): void {
        const waiter = this.waiters.get(key);
        if (waiter) {
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
        const endIndex = end === -1 ? list.value.length : end + 1;
        return list.value.slice(start, endIndex);
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
        if (result?.length) return [key, ...result];

        return new Promise((resolve) => {
            const timer = timeoutMs > 0 ? setTimeout(() => {
                this.waiters.delete(key);
                resolve(null);
            }, timeoutMs) : null;

            this.waiters.set(key, (value) => {
                if (timer) clearTimeout(timer);
                resolve(value);
            });
        });
    }

    remove(key: string): void {
        delete this.data[key];
    }
}