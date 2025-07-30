import {type Store } from "../types";

export default class MemoryStore implements Store {
    private store: Record<string, string> = {};

    get(key: string): string | null {
        return this.store[key] || null;
    }

    set(key: string, value: string): void {
        this.store[key] = value;
    }

    remove(key: string): void {
        delete this.store[key];
    }
}