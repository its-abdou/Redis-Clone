import { type Store } from '../store/interface.ts';
import { CommandExecutor } from '../commands';
import { encodeSimpleString, encodeError } from './encoder';

const executor = new CommandExecutor();

export async function parseRedisProtocol(command: string, store: Store): Promise<string> {
    const lines = command.split('\r\n');

    if (lines[0].startsWith('+')) return lines[0] + '\r\n';
    if (!lines[0].startsWith('*')) return encodeSimpleString('PONG');

    const args: string[] = [];
    for (let i = 1; i < lines.length; i += 2) {
        if (lines[i]?.startsWith('$') && lines[i + 1]) args.push(lines[i + 1]);
    }

    if (args.length === 0) return encodeError('empty command');

    const [cmd, ...cmdArgs] = args;
    return executor.execute(cmd, store, cmdArgs);
}