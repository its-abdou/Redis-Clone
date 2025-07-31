export const createError = (message: string): string => {
    return `-ERR ${message}\r\n`;
};

export const createSuccess = (message: string = 'OK'): string => {
    return `+${message}\r\n`;
};

export const createBulkString = (elements: string[]): string => {
    let bulkString = '';
    for (let i = 0; i <elements.length; i++) {
       bulkString =  `$${elements[i].length}\r\n${elements[i]}\r\n`;
    }
    return bulkString;
};
export const  createNullBulkString = (): string => {
    return "$-1\r\n";
};