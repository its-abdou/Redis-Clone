import { type Store } from '../types';
import { executeCommand } from '../commands';
import { createError, createSuccess } from './Encoder.ts';

export const parseRedisProtocol =async (command: string, store: Store): Promise<string> => {
    const lines = command.split('\r\n');

    // Handle RESP array format
    if (lines[0].startsWith('*')) {
        const args: string[] = [];

        for (let i = 1; i < lines.length; i += 2) {
            if (lines[i]?.startsWith('$') && lines[i + 1]) {
                args.push(lines[i + 1]);
            }
        }

        if (args.length === 0) {
            return createError('empty command');
        }

        const [command, ...commandArgs] = args;
        return await executeCommand(command, store, commandArgs);
    }

    // Fallback for simple commands
    return createSuccess('PONG');
};