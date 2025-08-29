
export const createArgCountError = (command: string): string =>
    `wrong number of arguments for '${command.toLowerCase()}' command`;