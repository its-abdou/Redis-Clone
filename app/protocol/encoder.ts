export const encodeSimpleString = (message: string = 'OK'): string => `+${message}\r\n`;

export const encodeError = (message: string): string => `-ERR ${message}\r\n`;

export const encodeBulkString = (value: string): string => `$${value.length}\r\n${value}\r\n`;

export const encodeNullBulkString = (): string => '$-1\r\n';

export const encodeArray = (elements: string[]): string => {
    let result = `*${elements.length}\r\n`;
    for (const element of elements) {
        result += encodeBulkString(element);
    }
    return result;
};

export const encodeNullArray = (): string => '*0\r\n';

export const encodeInteger = (value: number): string => `:${value}\r\n`;