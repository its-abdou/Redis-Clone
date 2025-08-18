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
    xadd(key:string , entry : string[] ): string;
    type(key:string): string | null;

}

export  type CommandHandler = (store :Store , args : string[]) => string | Promise<string>;
export type StreamMessage = {
    id: string;
    fields: Map<string, string>; // field-value pairs
};

// Union type for different Redis value types
export type RedisValue =
    | string                    // String values
    | string[]                  // List values
    | StreamMessage[];          // Stream values (array of messages)

// StoredValue with discriminated union for type safety
export type StoredValue = {
    expiresAt?: number;
} & (
    | { type: 'string'; value: string }
    | { type: 'list'; value: string[] }
    | { type: 'stream'; value: StreamMessage[] }
    );