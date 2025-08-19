import { encodeError } from '../protocol/encoder';

export const createArgCountError = (command: string): string =>
    `wrong number of arguments for '${command.toLowerCase()}' command`;