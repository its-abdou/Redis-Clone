export interface Store {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}

export  type CommandHandler = (store :Store , args : string[]) => string;