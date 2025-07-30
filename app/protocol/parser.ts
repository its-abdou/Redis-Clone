import { type Store } from '../types';
import { executeCommand } from '../commands';
import { createError, createSuccess } from '../utils/Encoder.ts';

export const parseRedisProtocol = (command: string, store: Store): string => {
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
        return executeCommand(command, store, commandArgs);
    }

    // Fallback for simple commands
    return createSuccess('PONG');
};