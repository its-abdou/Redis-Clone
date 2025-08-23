import { StringStore } from './string';

export class transactionStore {
  constructor(private stringStore: StringStore) {}

  incr(key: string, by: number = 1): number {
    const value = this.stringStore.get(key);

    const result = value ? Number(value) + by : by;
    this.stringStore.set(key, String(result));
    return result;
  }
}