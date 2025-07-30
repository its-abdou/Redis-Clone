export const createError = (message: string): string => {
    return `-ERR ${message}\r\n`;
};

export const createSuccess = (message: string = 'OK'): string => {
    return `+${message}\r\n`;
};

export const createBulkString = (value: string): string => {
    return `$${value.length}\r\n${value}\r\n`;
};