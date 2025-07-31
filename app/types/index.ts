export interface Store {
    get(key: string): string | null;
    set(key: string, value: string , ttl?: number ): void;
    remove(key: string): void;
    rpush(key:string , value : string[] ): number;
    lpush(key:string , value : string[] ): number;
    lrange(key:string , value : string[] ): string[];
}

export  type CommandHandler = (store :Store , args : string[]) => string;

type RedisValue = string | string[] | Record<string, string>;
export type StoredValue = {
    type : 'string'|'list';
    value : RedisValue;
    expiresAt?: number;
}