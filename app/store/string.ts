import {type StoredValue} from "./interface.ts";
export class StringStore {
    private data: Record<string, StoredValue & { type: 'string' }> = {};

    get(key: string): string | null {
        const item = this.data[key];
        if (!item || (item.expiresAt && item.expiresAt <= Date.now())) {
            this.remove(key);
            return null;
        }
        return item.value;
    }

    set(key: string, value: string, ttl?: number): void {
        this.data[key] = {
            type: 'string',
            value,
            expiresAt: ttl ? Date.now() + ttl : undefined,
        };
    }

    remove(key: string): void {
        delete this.data[key];
    }
}