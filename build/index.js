"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRDictStrings = exports.iXRLibBaseSetup = exports.iXRLibSend = exports.iXRLibAsync = exports.iXRLibStorage = exports.iXRLibInit = void 0;
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
Object.defineProperty(exports, "iXRLibInit", { enumerable: true, get: function () { return iXRLibAnalytics_1.iXRLibInit; } });
const iXRLibStorage_1 = require("./iXRLibStorage");
Object.defineProperty(exports, "iXRLibStorage", { enumerable: true, get: function () { return iXRLibStorage_1.iXRLibStorage; } });
const iXRLibAsync_1 = require("./iXRLibAsync");
Object.defineProperty(exports, "iXRLibAsync", { enumerable: true, get: function () { return iXRLibAsync_1.iXRLibAsync; } });
const iXRLibSend_1 = require("./iXRLibSend");
Object.defineProperty(exports, "iXRLibSend", { enumerable: true, get: function () { return iXRLibSend_1.iXRLibSend; } });
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
Object.defineProperty(exports, "iXRDictStrings", { enumerable: true, get: function () { return DotNetishTypes_1.iXRDictStrings; } });
// Initialize all static members
iXRLibAnalytics_1.iXRLibInit.InitStatics();
iXRLibStorage_1.iXRLibStorage.InitStatics();
iXRLibAsync_1.iXRLibAsync.InitStatics();
class iXRLibBaseSetup {
    static SetAppConfig(customConfig) {
        const defaultConfig = '<?xml version="1.0" encoding="utf-8" ?>' +
            '<configuration>' +
            '<appSettings>' +
            '<add key="REST_URL" value="https://dev-libapi.informxr.io/v1/"/>' +
            '<add key="SendRetriesOnFailure" value="3"/>' +
            '<!-- Bandwidth config parameters. -->' +
            '<add key="SendRetryInterval" value="00:00:03"/>' +
            '<add key="SendNextBatchWait" value="00:00:30"/>' +
            '<!-- 0 = infinite, i.e. never send remainders = always send exactly EventsPerSendAttempt. -->' +
            '<add key="StragglerTimeout" value="00:00:15"/>' +
            '<!-- 0 = Send all not-already-sent. -->' +
            '<add key="EventsPerSendAttempt" value="4"/>' +
            '<add key="LogsPerSendAttempt" value="4"/>' +
            '<add key="TelemetryEntriesPerSendAttempt" value="4"/>' +
            '<add key="StorageEntriesPerSendAttempt" value="4"/>' +
            '<!-- 0 = infinite, i.e. never prune. -->' +
            '<add key="PruneSentItemsOlderThan" value="12:00:00"/>' +
            '<add key="MaximumCachedItems" value="1024"/>' +
            '<add key="RetainLocalAfterSent" value="false"/>' +
            '</appSettings>' +
            '</configuration>';
        const szAppConfig = customConfig || defaultConfig;
        console.log(`Using ${customConfig ? 'user-defined' : 'default'} config`);
        DotNetishTypes_1.ConfigurationManager.DebugSetAppConfig(szAppConfig);
    }
    // Add any other base setup methods here
    static InitializeAll() {
        iXRLibBaseSetup.SetAppConfig();
        // Add any other initialization steps needed
    }
}
exports.iXRLibBaseSetup = iXRLibBaseSetup;
// Create a global instance for direct access
//if (typeof window !== 'undefined') {
//    (window as any).iXR = iXRLibBaseSetup;
//}
//# sourceMappingURL=index.js.map