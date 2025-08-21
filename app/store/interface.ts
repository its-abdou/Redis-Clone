export interface Store {
    get(key: string): string | null;
    set(key: string, value: string, ttl?: number): void;
    remove(key: string): void;
    rpush(key: string, values: string[]): number;
    lpush(key: string, elements: string[]): number;
    lrange(key: string, start: number, end: number): string[];
    llen(key: string): number;
    lpop(key: string, count?: number): string[] | null;
    blpop(key: string, timeoutMs: number): Promise<string[] | null>;
    xadd(key: string, id: string, fields: [string, string][]): string;
    xrange(key: string, start: string, end: string): [string, string[]][];
    xread(keys: string[], startIds: string[]): [string, [string, string[]][]][];
    xreadBlocking(keys: string[], startIds: string[], blockMS: number):Promise<[string, [string, string[]][]][] | null>;
    type(key: string): string | null;
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