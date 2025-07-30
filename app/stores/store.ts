export default class Store {
    private store: Record<string, string> = {};

    get(key: string): string | null {
        return this.store[key] || null;
    }

    set(key: string, value: string): void {
        console.log(`Store key: ${key} value: ${value}`);
        this.store[key] = value;
    }

    remove(key: string): void {
        delete this.store[key];
    }
}
