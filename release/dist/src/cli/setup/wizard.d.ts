import { SetupMode, SetupResult } from './types';
export declare function runSetupWizard(options?: {
    mode?: SetupMode;
}): Promise<SetupResult>;
