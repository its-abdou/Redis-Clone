export const createError = (message: string): string => {
    return `-ERR ${message}\r\n`;
};

export const createSuccess = (message: string = 'OK'): string => {
    return `+${message}\r\n`;
};

export const createBulkString = (value: string): string => {
    return `$${value.length}\r\n${value}\r\n`;
};
export const  createNullBulkString = (): string => {
    return "$-1\r\n";
};

export const createArray = (elements: string[]): string => {
    let array:string = `*${elements.length}\r\n`;
    for (let i = 0; i < elements.length; i++) {
        array+= `$${elements[i].length}\r\n${elements[i]}\r\n`;
    }
    return array;
};
export const  createNullArray = (): string => {
    return "*0\r\n";
};
