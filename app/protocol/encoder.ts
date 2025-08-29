export const encodeSimpleString = (message: string = 'OK'): string => `+${message}\r\n`;

export const encodeError = (message: string): string => `-ERR ${message}\r\n`;

export const encodeBulkString = (value: string): string => `$${value.length}\r\n${value}\r\n`;

export const encodeNullBulkString = (): string => '$-1\r\n';

export const encodeArray = (elements: (string|number)[]): string => {
    let result = `*${elements.length}\r\n`;
    for (const element of elements) {
        if (typeof element === 'number') {
            result += encodeInteger(element);
        }else {
        result += encodeBulkString(element);
        }
    }
    return result;
};

export const encodeStream = (entries : [string, string[]][]) => {
    if (entries.length === 0) {
        return '*0\r\n';
    }
    let response =`*${entries.length}\r\n`;
    for (const [id , fieldsValues] of entries) {
        response+= `*2\r\n`;
        response += encodeBulkString(id);
        response += encodeArray(fieldsValues);
    }
    return response;
}

export const encodeNullArray = (): string => '*-1\r\n';

export const encodeInteger = (value: number): string => `:${value}\r\n`;