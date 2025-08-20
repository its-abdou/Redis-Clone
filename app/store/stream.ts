import {type StoredValue , type StreamMessage} from "./interface.ts";

export class StreamStore {
    private data: Record<string, StoredValue & { type: 'stream' }> = {};

    getLastStreamId(key: string): string | null {
        const item = this.data[key];
        if (!item || item.type !== 'stream' || item.value.length === 0) return null;
        return item.value[item.value.length - 1].id;
    }
    getFirstStreamId(key: string): string | null {
        const item = this.data[key];
        if (!item || item.type !== 'stream' || item.value.length === 0) return null;
        return item.value[0].id;
    }

    private compareStreamId(id1: string, id2: string): number {
        const [ts1, seq1] = id1.split('-').map(Number);
        const [ts2, seq2] = id2.split('-').map(Number);
        return ts1 !== ts2 ? ts1 - ts2 : seq1 - seq2;
    }

    private generateId(key: string, idType: string, id: string): string {
        const lastId = this.getLastStreamId(key);
        let sequence = 0;
        let timestamp: number;

        if (idType === "auto-sequence") {
            const [timestampStr] = id.split("-");
            timestamp = Number(timestampStr) || 0;
        } else {
            timestamp = Date.now();
        }

        if (lastId) {
            const [lastTimestamp, lastSequence] = lastId.split("-").map(Number);
            if (timestamp === lastTimestamp) {
                sequence = lastSequence + 1;
            }
        }

        if (timestamp === 0 && sequence === 0) {
            sequence = 1;
        }

        return `${timestamp}-${sequence}`;
    }

    private classifyId(id: string): string {
        if (id === '*') return 'auto-full';
        const [, sequence] = id.split('-');
        return sequence === '*' ? 'auto-sequence' : 'explicit';
    }

    private validateStreamId(key: string, id: string): string {
        const [timestamp, sequence] = id.split('-').map(Number);

        if (isNaN(timestamp) || isNaN(sequence)) {
            throw new Error('Invalid stream ID format');
        }

        if (timestamp === 0 && sequence === 0) {
            throw new Error('The ID specified in XADD must be greater than 0-0');
        }

        const lastId = this.getLastStreamId(key);
        if (lastId) {
            const [lastTimestamp, lastSequence] = lastId.split('-').map(Number);
            if (timestamp < lastTimestamp || (timestamp === lastTimestamp && sequence <= lastSequence)) {
                throw new Error('The ID specified in XADD is equal or smaller than the target stream top item');
            }
        }

        return id;
    }

    xadd(key: string, id: string, fields: [string, string][]): string {
        const idType = this.classifyId(id);
        const actualId = idType === 'explicit' ? id : this.generateId(key, idType, id);
        const validatedId = this.validateStreamId(key, actualId);

        const streamMessage: StreamMessage = {
            id: validatedId,
            fields: new Map(fields),
        };

        let stream = this.data[key];
        if (!stream || stream.type !== 'stream') {
            stream = { type: 'stream', value: [] };
            this.data[key] = stream;
        }

        stream.value.push(streamMessage);
        return validatedId;
    }

    xrange(key: string, start: string, end: string): [string, string[]][] {
        const item = this.data[key];
        let startId:string , endId:string;

        if (!item || item.type !== 'stream' || item.value.length === 0) {
            return [];
        }
         if (start==='-'){
             startId = this?.getFirstStreamId(key) || '';
         }else {
             startId = start.includes('-') ? start : `${start}-0`;
         }
         if (end==='+'){
             endId = this?.getLastStreamId(key) || '';
         }else {
             endId = end.includes('-') ? end : `${end}-${Number.MAX_SAFE_INTEGER}`;
         }


        return item.value
            .filter(entry =>
                this.compareStreamId(entry.id, startId) >= 0 &&
                this.compareStreamId(entry.id, endId) <= 0
            )
            .map(entry => [
                entry.id,
                Array.from(entry.fields).flatMap(([key, value]) => [key, value])
            ]);
    }

    remove(key: string): void {
        delete this.data[key];
    }
}