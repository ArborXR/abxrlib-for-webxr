export declare enum DatabaseResult {
    eOk = 0,
    eBlewException = 1,
    eDatabaseConnectFailed = 2,
    eDatabaseConnectCouldNotParseSchema = 3,
    eDatabaseNotConnected = 4,
    eNoColumns = 5,
    eNoRows = 6,
    ePrimaryKeyColumnDoesNotExist = 7,
    eParentKeyColumnDoesNotExist = 8,
    eWhereClauseColumnDoesNotExist = 9,
    ePartialColumns = 10,
    eBeginTransactionFailed = 11,
    eEndTransactionFailed = 12,
    eExecuteRecordsetFailed = 13,
    ePrepareFailed = 14,
    eBindColumnFailed = 15,
    eStepAfterPrepareFailed = 16
}
export declare function DatabaseResultToString(eDbRet: DatabaseResult): string;
export declare function DbSuccess(eRet: DatabaseResult): boolean;
