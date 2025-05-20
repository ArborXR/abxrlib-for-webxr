import { iXRLibInit } from "./iXRLibAnalytics";
import { iXRLibStorage } from "./iXRLibStorage";
import { iXRLibAsync } from "./iXRLibAsync";
import { iXRLibSend } from "./iXRLibSend";
import { iXRDictStrings } from './network/utils/DotNetishTypes';
declare class iXRLibBaseSetup {
    static SetAppConfig(customConfig?: string): void;
    static InitializeAll(): void;
}
export { iXRLibInit, iXRLibStorage, iXRLibAsync, iXRLibSend, iXRLibBaseSetup, iXRDictStrings };
