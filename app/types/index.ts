export interface Store {
    get(key: string): string | null;
    set(key: string, value: string , ttl?: number ): void;
    remove(key: string): void;
    rpush(key:string , value : string[] ): number;
    lpush(key:string , value : string[] ): number;
    lrange(key:string , value : string[] ): string[];
    llen(key:string ): number;
    lpop(key:string, value? : string ): string[]| null;
    blpop(key:string, delay : number ): Promise< string[]| null>;
    type(key:string): string | null;

}

export  type CommandHandler = (store :Store , args : string[]) => string | Promise<string>;

type RedisValue = string | string[] | Record<string, string>;
export type StoredValue = {
    type : 'string'|'list';
    value : RedisValue;
    expiresAt?: number;
}