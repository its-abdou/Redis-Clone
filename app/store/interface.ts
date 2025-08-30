export interface Store {
    get(key: string,transactionState:transactionState): string | null;
    set(key: string, value: string, transactionState:transactionState,ttl?: number): string| void;
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
    type(key: string,transactionState:transactionState): string | null;
    incr(key:string, by:number,transactionState:transactionState):string|number;
    multi(transactionState:transactionState):void;
    exec(transactionState:transactionState):(RedisValue|null|void|Error)[];
    discard(transactionState:transactionState):void;

    info(option?:string):string;
}
export interface transactionState {
    inTransaction:boolean;
    transactionQueue : RedisCommand[];
}
export type CommandHandler = (store: Store, args: string[], transactionState: transactionState) => Promise<string>;
export type StreamMessage = {
    id: string;
    fields: Map<string, string>; // field-value pairs
};
export type RedisCommand = () => RedisValue|null|void;

export type RedisValue =
    | string                    // String values
    | string[]
    | number// List values
    | StreamMessage[];          // Stream values (array of messages)

// StoredValue with discriminated union for type safety
export type StoredValue = {
    expiresAt?: number;
} & (
    | { type: 'string'; value: string }
    | { type: 'list'; value: string[] }
    | { type: 'stream'; value: StreamMessage[] }
    );