import {type transactionState, type StoredValue} from "./interface.ts";
export class StringStore {

    private data: Record<string, StoredValue & { type: 'string' }> = {};

    get(key: string,transactionState:transactionState): string | null {
      const action =()=>{
          const item = this.data[key];
          if (!item || (item.expiresAt && item.expiresAt <= Date.now())) {
              this.remove(key);
              return null;
          }
          return item.value;
      }

        if (transactionState.inTransaction) {
            transactionState.transactionQueue.push(action);
            return "QUEUED";
        }
      return action()
    }

    set(key: string, value: string,transactionState:transactionState, ttl?: number): string|void {

        const action =()=>{
            this.data[key] = {
                type: 'string',
                value,
                expiresAt: ttl ? Date.now() + ttl : undefined,
            };
        }
        if (transactionState.inTransaction) {
            transactionState.transactionQueue.push(action);
            return "QUEUED";
        }
        return action()
    }

    incr(key: string, by: number = 1, transactionState:transactionState): string|number {
        const action =()=>{
            const value = this.get(key, transactionState);
            if(value && Number.isNaN(Number(value))) throw new Error('value is not an integer or out of range')
            const result = value ? Number(value) + by : by;
            this.set(key, String(result), transactionState);
            return result;
        }
        if (transactionState.inTransaction) {
            transactionState.transactionQueue.push(action);
            return "QUEUED";
        }
        return action();
    }

    remove(key: string): void {
        delete this.data[key];
    }
}