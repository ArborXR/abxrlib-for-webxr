"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRXXXTestScalarContainer = void 0;
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const iXRLibSend_1 = require("./iXRLibSend");
const iXRLibStorage_1 = require("./iXRLibStorage");
const types_1 = require("./network/types");
const cryptoUtils_1 = require("./network/utils/cryptoUtils");
const DataObjectBase_1 = require("./network/utils/DataObjectBase");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
const iXRLibCoreModelTests_1 = require("./test/iXRLibCoreModelTests");
const iXRLibAnalyticsTests_1 = require("./test/iXRLibAnalyticsTests");
// Mock window object for Node.js environment
if (typeof window === 'undefined') {
    global.window = {
        location: {
            search: '',
            pathname: '/',
            href: 'http://localhost/',
        },
        history: {
            pushState: (state, title, url) => {
                global.window.location.search = url.split('?')[1] || '';
            },
            replaceState: (state, title, url) => {
                global.window.location.search = url.split('?')[1] || '';
            },
        },
    };
}
// ---
class TestChild extends (_b = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_nGardenWall = 3.4;
        this.m_szDingALing = "My ding a ling.";
    }
    // ---
    GetMapProperties() {
        return TestChild.m_mapProperties;
    }
}
_a = TestChild;
// ---
TestChild.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_b, "m_mapProperties", _a).m_rfp, { m_nGardenWall: new DataObjectBase_1.FieldProperties("garden_wall") }, { m_szDingALing: new DataObjectBase_1.FieldProperties("ding_a_ling") }));
class TestListChild extends (_d = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_szDemented = "Ghastly Gary";
        this.m_nBartSimpson = 3.1415926535897932384626433;
    }
    // ---
    GetMapProperties() {
        return TestListChild.m_mapProperties;
    }
}
_c = TestListChild;
// ---
TestListChild.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_d, "m_mapProperties", _c).m_rfp, { m_szDemented: new DataObjectBase_1.FieldProperties("demented", DataObjectBase_1.FieldPropertyFlags.bfExclude) }, { m_nBartSimpson: new DataObjectBase_1.FieldProperties("bart_simpson") }));
class TestData extends (_f = DataObjectBase_1.DataObjectBase) {
    // ---
    constructor() {
        super();
        this.m_nStrictlyCommercial = 1.2;
        this.m_szSomeString = "with a lead filled snowshoe.";
        this.m_objTestChild = new TestChild();
        this.m_dictTest = new DotNetishTypes_1.iXRDictStrings();
        this.m_listTestListChild = new DataObjectBase_1.DbSet(TestListChild);
        this.m_listTestStringList = new DotNetishTypes_1.StringList();
        this.m_dictTest.Add("key", "value");
        this.m_dictTest.Add("ключь", "значение");
        this.m_listTestListChild.Add(new TestListChild());
        this.m_listTestListChild.Add(new TestListChild());
        this.m_listTestListChild.Add(new TestListChild());
        this.m_listTestStringList.push("warm");
        this.m_listTestStringList.push("leatherette");
        this.m_listTestStringList.push("feel");
        this.m_listTestStringList.push("the");
        this.m_listTestStringList.push("steering");
        this.m_listTestStringList.push("wheel");
    }
    // ---
    GetMapProperties() {
        return TestData.m_mapProperties;
    }
}
_e = TestData;
// ---
TestData.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_f, "m_mapProperties", _e).m_rfp, { m_nStrictlyCommercial: new DataObjectBase_1.FieldProperties("strictly_commercial") }, { m_szSomeString: new DataObjectBase_1.FieldProperties("some_string") }, { m_objTestChild: new DataObjectBase_1.FieldProperties("test_child", DataObjectBase_1.FieldPropertyFlags.bfChild, TestChild.m_mapProperties) }, { m_dictTest: new DataObjectBase_1.FieldProperties("dict_test") }, { m_listTestListChild: new DataObjectBase_1.FieldProperties("test_list_child", DataObjectBase_1.FieldPropertyFlags.bfChildList, TestListChild.m_mapProperties) }, { m_listTestStringList: new DataObjectBase_1.FieldProperties("test_string_list") }));
class DbSetsOfStuff extends DataObjectBase_1.DataObjectBase {
    constructor() {
        super(...arguments);
        this.m_listTestDatas = new DataObjectBase_1.DbSet(TestData);
        this.m_listTestChildren = new DataObjectBase_1.DbSet(TestChild);
    }
}
class iXRXXXTestScalarContainer extends (_h = iXRLibCoreModel_1.iXRBase) {
    // ---
    constructor(tTypeOfT) {
        super();
        this.m_tIXRXXX = {};
        this.m_tIXRXXX = new tTypeOfT();
    }
    // ---
    //constructor(tTypeOfT: any)
    //{
    //	super();
    //	this.m_tIXRXXX = new tTypeOfT();
    //}
    GetMapProperties() {
        return iXRXXXTestScalarContainer.m_mapProperties;
    }
}
exports.iXRXXXTestScalarContainer = iXRXXXTestScalarContainer;
_g = iXRXXXTestScalarContainer;
iXRXXXTestScalarContainer.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_h, "m_mapProperties", _g).m_rfp, { m_tIXRXXX: new DataObjectBase_1.FieldProperties("data", DataObjectBase_1.FieldPropertyFlags.bfChild) }));
;
function DebugSetAppConfig() {
    var szAppConfig = '<?xml version="1.0" encoding="utf-8" ?>' +
        '<configuration>' +
        '<appSettings>' +
        '<add key="REST_URL" value="http://192.168.5.24:9000/v1/"/>' +
        '<!--<add key="REST_URL" value="http://192.168.5.2:19080/"/>-->' +
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
    DotNetishTypes_1.ConfigurationManager.DebugSetAppConfig(szAppConfig);
}
function TestRegex() {
    const targetText = "SomeT1extSomeT2extSomeT3extSomeT4extSomeT5extSomeT6ext";
    const reg = /e(.*?)e/g;
    let result = null;
    while ((result = reg.exec(targetText)) !== null) {
        console.log(result[0]);
    }
}
async function TestHttp() {
    var objRequest = new types_1.CurlHttp();
    var dtNow = new DotNetishTypes_1.DateTime();
    var szResponse = "";
    objRequest.AddHttpHeader("Host", iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.GetRestUrlObject().HostAndPort());
    objRequest.AddHttpHeader("Accept", "application/json");
    objRequest.AddHttpHeader("UserAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; rv:109.0) Gecko/20100101 Firefox/119.0");
    objRequest.AddHttpHeader("Accept-Language", "en-US; q=0.5, en; q=0.5");
    objRequest.AddHttpHeader("Accept-Encoding", "gzip, deflate");
    objRequest.AddHttpHeader("Content-Type", "application/json"); // May need to parse pbBodyContent someday to distinguish Content-Type and Accept header settings.
    // ---
    objRequest.AddHttpAuthHeader("Bearer", 'this.m_szApiToken');
    objRequest.AddHttpHeader("X-iXRLib-Hash", "wpIeZXbCmG1HYQ/CpMK0BWFFE8K/cSsnw41hA8KrwrVnFsKcSsOnG2YN");
    objRequest.AddHttpHeader("X-iXRLib-Timestamp", dtNow.ToString());
    // ---
    await objRequest.Post("http://192.168.5.2:19080/api/v1/telemetry", [], Buffer.from("Some egregiously invalid body content."), { szResponse: "" });
    console.log(objRequest.m_objResponse);
}
async function TestLoginAndSend() {
    var ixrEvent = new iXRLibCoreModel_1.iXREvent();
    var seAsyncOperationComplete = new types_1.SyncEvent();
    // var eRet:						iXRResult = iXRResult.eOk;
    iXRLibAnalytics_1.iXRLibInit.Start();
    DataObjectBase_1.FieldPropertiesRecordContainer.FromString({ obj: iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration, szKey: 'm_tsPruneSentItemsOlderThan' }, "12:00:00");
    DataObjectBase_1.FieldPropertiesRecordContainer.FromString({ obj: iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration, szKey: 'm_nMaximumCachedItems' }, "1025");
    DataObjectBase_1.FieldPropertiesRecordContainer.FromString({ obj: iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration, szKey: 'm_bRetainLocalAfterSent' }, "false");
    DataObjectBase_1.FieldPropertiesRecordContainer.FromString({ obj: iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration, szKey: 'm_dictAuthMechanism' }, "{\"Hey\": \"Pedro\", \"There\": \"Juan\", \"What\": \"Up\"}");
    console.log(iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration);
    var dtNow = DotNetishTypes_1.DateTime.ConvertUnixTime(DotNetishTypes_1.DateTime.Now()), dtOlderThan = DotNetishTypes_1.DateTime.ConvertUnixTime(dtNow.ToUnixTime() - iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan.ToInt64());
    if (await iXRLibAnalyticsTests_1.iXRLibAnalyticsTests.TestAuthenticate() === DotNetishTypes_1.iXRResult.eOk) {
        await iXRLibAnalyticsTests_1.iXRLibAnalyticsTests.AddXXX(iXRLibCoreModel_1.iXREvent, true, seAsyncOperationComplete, true, iXRLibSend_1.iXRLibSend.EventSynchronousCore, /*iXRLibSend.EventCore*/ null);
        await iXRLibAnalyticsTests_1.iXRLibAnalyticsTests.AddXXX(iXRLibCoreModel_1.iXRTelemetry, true, seAsyncOperationComplete, true, iXRLibSend_1.iXRLibSend.AddTelemetryEntrySynchronousCore, /*iXRLibSend.AddTelemetryEntryCore*/ null);
        await iXRLibAnalyticsTests_1.iXRLibAnalyticsTests.AddXXX(iXRLibCoreModel_1.iXRLog, true, seAsyncOperationComplete, true, iXRLibSend_1.iXRLibSend.AddLogSynchronous, /*iXRLibSend.AddLog*/ null);
    }
    ixrEvent.FakeUpSomeRandomCrap(true);
    await iXRLibSend_1.iXRLibSend.EventSynchronousCore(ixrEvent);
}
async function PrintStuffEveryThirdOfASecond() {
    var i;
    for (i = 0; i < 30; i++) {
        console.log(`I is ${i}`);
        await (0, types_1.Sleep)(333);
    }
    return 0;
}
async function PrintStuffEveryHalfOfASecond() {
    var j;
    for (j = 0; j < 20; j++) {
        console.log(`J is ${j}`);
        await (0, types_1.Sleep)(500);
    }
    return 1;
}
async function TestJson() {
    var objTestData = new TestData();
    var szJSON = "";
    var bLooped = false;
    var obj = new DbSetsOfStuff();
    var pdsIXRXXX = null;
    var tsTest = DotNetishTypes_1.TimeSpan.Parse("12:34:56");
    var ixrEvent = new iXRLibCoreModel_1.iXREvent();
    var suidTest = new types_1.SUID();
    var bufferTest = Buffer.from([23, 56, 26, 78, 45, 12, 89, 54]);
    var objTestScalarContainer = new iXRXXXTestScalarContainer(TestData);
    try {
        // Sequential.
        // await PrintStuffEveryThirdOfASecond();
        // await PrintStuffEveryHalfOfASecond();
        // Parallel.
        // const [x, y] = await Promise.all([PrintStuffEveryThirdOfASecond(), PrintStuffEveryHalfOfASecond()]);
        // console.log(`x is ${x} and y is ${y}`);
        DebugSetAppConfig();
        // await TestHttp();
        // TestRegex();
        await TestLoginAndSend();
        bufferTest = await (0, cryptoUtils_1.SHA256)("Hello, world!");
        try {
            console.log(types_1.Base64.Encode(bufferTest));
        }
        catch (e) {
            console.log(e);
        }
        console.log(suidTest.ToString());
        // iXRLibAnalytics.m_ixrLibAsync.AddTask(async (o: any): Promise<iXRResult> => { console.log("Sleeping..."); await Sleep(3000); console.log("Never shoot no dear."); return iXRResult.eOk; }, objTestData, (o: any):void => { console.log("It's just flooded I'll be ok."); });
        // ---
        console.log(DbSetsOfStuff);
        iXRLibAnalytics_1.iXRLibInit.Start();
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapEvent)(ixrEvent, true);
        await iXRLibSend_1.iXRLibSend.EventSynchronousCore(ixrEvent);
        // if (typeof(DbSetsOfStuff) === "function")
        // {
        // 	console.log("It is a function");
        // }
        await (0, types_1.Sleep)(400000);
        // for (const [szField, objField] of Object.entries(obj))
        // {
        // 	console.log(szField, " ", typeof(objField));
        // 	if (objField instanceof DbSet)
        // 	{
        // 		if (objField.ContainedType() === TestData)
        // 		{
        // 			console.log("Found it: ", szField);
        // 			pdsIXRXXX = objField;
        // 			break;
        // 		}
        // 	}
        // }
        szJSON = (0, DataObjectBase_1.GenerateJson)(objTestData, DataObjectBase_1.DumpCategory.eDumpingJsonForBackend);
        // console.log(szJSON);
        szJSON = JSON.stringify(objTestData, TestData.m_mapProperties.replacer);
        // console.log(szJSON);
    }
    catch (e) {
        (0, types_1.logError)("TestJson", e);
    }
}
async function main() {
    try {
        await TestJson();
    }
    catch (error) {
        (0, types_1.logError)('Main test function', error);
    }
}
// Run the main function
main();
//# sourceMappingURL=test.js.map