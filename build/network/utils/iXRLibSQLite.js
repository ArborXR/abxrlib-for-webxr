"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbSuccess = exports.DatabaseResultToString = exports.DatabaseResult = void 0;
/// <summary>
/// Results of database operations.
/// </summary>
var DatabaseResult;
(function (DatabaseResult) {
    DatabaseResult[DatabaseResult["eOk"] = 0] = "eOk";
    DatabaseResult[DatabaseResult["eBlewException"] = 1] = "eBlewException";
    DatabaseResult[DatabaseResult["eDatabaseConnectFailed"] = 2] = "eDatabaseConnectFailed";
    DatabaseResult[DatabaseResult["eDatabaseConnectCouldNotParseSchema"] = 3] = "eDatabaseConnectCouldNotParseSchema";
    DatabaseResult[DatabaseResult["eDatabaseNotConnected"] = 4] = "eDatabaseNotConnected";
    DatabaseResult[DatabaseResult["eNoColumns"] = 5] = "eNoColumns";
    DatabaseResult[DatabaseResult["eNoRows"] = 6] = "eNoRows";
    DatabaseResult[DatabaseResult["ePrimaryKeyColumnDoesNotExist"] = 7] = "ePrimaryKeyColumnDoesNotExist";
    DatabaseResult[DatabaseResult["eParentKeyColumnDoesNotExist"] = 8] = "eParentKeyColumnDoesNotExist";
    DatabaseResult[DatabaseResult["eWhereClauseColumnDoesNotExist"] = 9] = "eWhereClauseColumnDoesNotExist";
    DatabaseResult[DatabaseResult["ePartialColumns"] = 10] = "ePartialColumns";
    DatabaseResult[DatabaseResult["eBeginTransactionFailed"] = 11] = "eBeginTransactionFailed";
    DatabaseResult[DatabaseResult["eEndTransactionFailed"] = 12] = "eEndTransactionFailed";
    DatabaseResult[DatabaseResult["eExecuteRecordsetFailed"] = 13] = "eExecuteRecordsetFailed";
    DatabaseResult[DatabaseResult["ePrepareFailed"] = 14] = "ePrepareFailed";
    DatabaseResult[DatabaseResult["eBindColumnFailed"] = 15] = "eBindColumnFailed";
    DatabaseResult[DatabaseResult["eStepAfterPrepareFailed"] = 16] = "eStepAfterPrepareFailed";
})(DatabaseResult = exports.DatabaseResult || (exports.DatabaseResult = {}));
;
function DatabaseResultToString(eDbRet) {
    switch (eDbRet) {
        case DatabaseResult.eOk:
            return "Ok";
        case DatabaseResult.eBlewException:
            return "Blew Exception";
        case DatabaseResult.eDatabaseConnectFailed:
            return "DatabaseConnect Failed";
        case DatabaseResult.eDatabaseConnectCouldNotParseSchema:
            return "Database Connect Could Not Parse Schema";
        case DatabaseResult.eDatabaseNotConnected:
            return "Database Not Connected";
        case DatabaseResult.eNoColumns:
            return "No Columns";
        case DatabaseResult.eNoRows:
            return "No Rows";
        case DatabaseResult.ePrimaryKeyColumnDoesNotExist:
            return "Primary Key Column Does Not Exist";
        case DatabaseResult.eParentKeyColumnDoesNotExist:
            return "Parent Key Column Does Not Exist";
        case DatabaseResult.eWhereClauseColumnDoesNotExist:
            return "Where Clause Column Does Not Exist";
        case DatabaseResult.ePartialColumns:
            return "Partial Columns";
        case DatabaseResult.eBeginTransactionFailed:
            return "Begin Transaction Failed";
        case DatabaseResult.eEndTransactionFailed:
            return "End Transaction Failed";
        case DatabaseResult.eExecuteRecordsetFailed:
            return "Execute Recordset Failed";
        case DatabaseResult.ePrepareFailed:
            return "Prepare Failed";
        case DatabaseResult.eBindColumnFailed:
            return "Bind Column Failed";
        case DatabaseResult.eStepAfterPrepareFailed:
            return "Step After Prepare Failed";
        default:
            break;
    }
    return "Forgot a Case Statement";
}
exports.DatabaseResultToString = DatabaseResultToString;
/// <summary>
/// When only interested in hard failures... this regards soft failures (ePartialColumns)
///		as success, or more precisely, not a failure.
/// </summary>
/// <param name="eRet"></param>
/// <returns></returns>
function DbSuccess(eRet) {
    return (eRet === DatabaseResult.eOk || eRet === DatabaseResult.ePartialColumns);
}
exports.DbSuccess = DbSuccess;
//# sourceMappingURL=iXRLibSQLite.js.map