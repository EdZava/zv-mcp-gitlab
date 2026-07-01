export type InstanceSubcommand = 'list' | 'add' | 'remove' | 'test' | 'info' | 'sample-config';
export declare function parseInstanceSubcommand(args: string[]): {
    subcommand: InstanceSubcommand | undefined;
    subArgs: string[];
};
export declare function runInstanceCommand(args: string[]): Promise<void>;
