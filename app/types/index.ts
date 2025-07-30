export interface Store {
    get(key: string): string | null;
    set(key: string, value: string , ttl?: number ): void;
    remove(key: string): void;
}

export  type CommandHandler = (store :Store , args : string[]) => string;

export type StoredValue = {
    value : string;
    expiresAt?: number;
}