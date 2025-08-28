import {type RedisCommand, type StoredValue} from "./interface.ts";
export class StringStore {
    constructor(private transactionState: {inTransaction:boolean, transactionQueue:RedisCommand[]}) {}
    private data: Record<string, StoredValue & { type: 'string' }> = {};

    get(key: string): string | null {
      const action =()=>{
          const item = this.data[key];
          if (!item || (item.expiresAt && item.expiresAt <= Date.now())) {
              this.remove(key);
              return null;
          }
          return item.value;
      }


      return action()
    }

    set(key: string, value: string, ttl?: number): string|void {
        console.log(this.transactionState.inTransaction)
        const action =()=>{
            this.data[key] = {
                type: 'string',
                value,
                expiresAt: ttl ? Date.now() + ttl : undefined,
            };
        }
        if (this.transactionState.inTransaction) {
            this.transactionState.transactionQueue.push(action);
            return "QUEUED";
        }
        return action()
    }

    incr(key: string, by: number = 1): string|number {
        const action =()=>{
            const value = this.get(key);
            if(value && Number.isNaN(Number(value))) throw new Error('value is not an integer or out of range')
            const result = value ? Number(value) + by : by;
            this.set(key, String(result));
            return result;
        }
        if (this.transactionState.inTransaction) {
            this.transactionState.transactionQueue.push(action);
            return "QUEUED";
        }
        return action();
    }

    remove(key: string): void {
        delete this.data[key];
    }
}