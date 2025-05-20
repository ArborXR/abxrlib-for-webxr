"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitAllStatics = exports.iXRInitAllStatics = void 0;
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
const iXRLibAsync_1 = require("./iXRLibAsync");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const iXRLibStorage_1 = require("./iXRLibStorage");
class iXRInitAllStatics {
    static InitStatics() {
        iXRLibAnalytics_1.iXRLibInit.InitStatics();
        iXRLibAnalytics_1.iXRLibAnalytics.InitStatics();
        iXRLibAsync_1.iXRLibAsync.InitStatics();
        iXRLibCoreModel_1.iXRBase.InitStatics();
        iXRLibCoreModel_1.iXREvent.InitStatics();
        iXRLibCoreModel_1.DbSetStorage.InitStatics();
        iXRLibStorage_1.iXRLibStorage.InitStatics();
    }
}
exports.iXRInitAllStatics = iXRInitAllStatics;
/// <summary>
/// One of TypeScript's many eccentricities... it 'supports' initializing members at their declaration but if you actually do it
///		you get an error that gives no clue that this is the problem.  This leads to 2 patterns:  initialize all non-static members
///		in the constructor() NOT the members, and then this:  initialize all statics with a global call, NOT the members.
/// ---
/// More commentary:  This worked in the very specific code tree where it was branched off Jijo's code.  When I condensed it down
///		to just what is necessary for the port, this started having init-order issues.  Hence, InitAllStatics() below is called in
///		iXRLib.Start().  Also, static { this.InitStatics(); } was tried... which results in the error that inspired this code.
/// </summary>
// iXRInitAllStatics.InitStatics();
function InitAllStatics() {
    iXRInitAllStatics.InitStatics();
}
exports.InitAllStatics = InitAllStatics;
//# sourceMappingURL=iXRLibGlobal.js.map