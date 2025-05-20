"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUpSomeRandomCrapDbContext = exports.FakeUpSomeRandomCrapStorage = exports.FakeUpSomeRandomCrapStorageData = exports.FakeUpSomeRandomCrapEvent = exports.FakeUpSomeDifferentCrapEvent = exports.FakeUpSomeCrapEvent = exports.FakeUpSomeRandomCrapAIProxy = exports.FakeUpSomeRandomCrapTelemetry = exports.FakeUpSomeRandomCrapLog = exports.FakeUpSomeRandomCrapLocation = exports.FakeUpSomeRandomCrapApplication = void 0;
const DotNetishTypes_1 = require("../../src/network/utils/DotNetishTypes");
const iXRLibCoreModel_1 = require("../iXRLibCoreModel");
/// <summary>
/// Application object... from "Database Models" doc... Represents the software application in use.
/// </summary>
function FakeUpSomeRandomCrapApplication(obj) {
    var pszAppIds = ["a44654", "a51654", "a57649", "a75638", "a83659", "a90376", "a45723"];
    var pszUserIds = ["u84967", "u74857", "u94748", "u84736", "u29683", "u98375", "u45823"];
    var pszDeviceIds = ["d83746", "d98264", "d83769", "d23985", "d34985", "d34985", "d24397"];
    var pszLogLevels = ["Stygian", "Low", "Medium", "High", "Stratospheric"];
    var pszDatas = ["The thing = 3", "Orange = the new Indigo", "Rock on Chicago", "Будет пухом, Нина Сергеевна", "Magikist", "Glenn Miller", "Frank Sinatra", "Lena Horne"];
    var rnd = new DotNetishTypes_1.Random();
    obj.m_szAppId = pszAppIds[rnd.Next(pszAppIds.length)];
    obj.m_szDeviceUserId = pszUserIds[rnd.Next(pszUserIds.length)];
    obj.m_szDeviceId = pszDeviceIds[rnd.Next(pszDeviceIds.length)];
    obj.m_szLogLevel = pszLogLevels[rnd.Next(pszLogLevels.length)];
    obj.m_szData = pszDatas[rnd.Next(pszDatas.length)];
}
exports.FakeUpSomeRandomCrapApplication = FakeUpSomeRandomCrapApplication;
function FakeUpSomeRandomCrapLocation(obj) {
    var rnd = new DotNetishTypes_1.Random();
    obj.m_dX = (rnd.Next(625)) / 5.0;
    obj.m_dY = (rnd.Next(625)) / 5.0;
    obj.m_dZ = (rnd.Next(625)) / 5.0;
}
exports.FakeUpSomeRandomCrapLocation = FakeUpSomeRandomCrapLocation;
function FakeUpSomeRandomCrapLog(obj) {
    var pszTexts = [
        "Something bad happened.",
        "Something implausibly good happened.",
        "Something to which the complacent bourgeoisie is indifferent happened.",
        "Нукюлар war happened."
    ];
    var rnd = new DotNetishTypes_1.Random();
    obj.m_szLogLevel = (0, iXRLibCoreModel_1.LogLevelToString)(rnd.Next(5));
    obj.m_szText = pszTexts[rnd.Next(pszTexts.length)];
    obj.m_dictMeta.Add("Yes log", "All kids love log");
    obj.m_dictMeta.Add("Rock on Chicago", "3141");
}
exports.FakeUpSomeRandomCrapLog = FakeUpSomeRandomCrapLog;
function FakeUpSomeRandomCrapTelemetry(obj) {
    var pszNames = [
        "Right controller",
        "Battery",
        "Aggravated battery",
        "User looked at something significant",
        "User fell asleep"
    ];
    var rnd = new DotNetishTypes_1.Random();
    obj.m_szName = pszNames[rnd.Next(pszNames.length)];
    obj.m_dictMeta.Add("galaxy", "Lousy Day");
    obj.m_dictMeta.Add("Squirrel", "2718");
}
exports.FakeUpSomeRandomCrapTelemetry = FakeUpSomeRandomCrapTelemetry;
function FakeUpSomeRandomCrapAIProxy(obj) {
    var pszPrompts = [
        "Hey you!",
        "Achtung!",
        "Ping!",
        "Здравствуйте!",
        "Hey mon."
    ];
    var pszLMMProviders = [
        "OpenAI",
        "ChatGPT",
        "CIAMainframe",
        "ФСБ",
        "Gemini"
    ];
    var rnd = new DotNetishTypes_1.Random();
    obj.m_szPrompt = pszPrompts[rnd.Next(pszPrompts.length)];
    obj.m_dictPastMessages.Add("Hey you!", "Trout mask replica.");
    obj.m_dictPastMessages.Add("Achtung!", "There is always someone with you.");
}
exports.FakeUpSomeRandomCrapAIProxy = FakeUpSomeRandomCrapAIProxy;
/// <summary>
/// Event object... from "ixrlib Spec 2023" doc... the main event object that will be profligately POST/PUT/ETCed to the backend for data analytics.
/// </summary>
function FakeUpSomeCrapEvent(obj) {
    obj.m_dictMeta.Add("key1", "1");
    obj.m_dictMeta.Add("key2", "value2");
    obj.m_dictMeta.Add("key3", "3");
    obj.m_dictMeta.Add("key4", "value4");
}
exports.FakeUpSomeCrapEvent = FakeUpSomeCrapEvent;
function FakeUpSomeDifferentCrapEvent(obj) {
    var rnd = new DotNetishTypes_1.Random();
    obj.m_dictMeta.Add("key1", "value1");
    obj.m_dictMeta.Add("key2", "value2");
    obj.m_dictMeta.Add("key3", "value3");
    obj.m_dictMeta.Add("key4", "value4");
}
exports.FakeUpSomeDifferentCrapEvent = FakeUpSomeDifferentCrapEvent;
// export function FakeUpSomeRandomCrapEvent(obj: iXREvent): void
// {
// 	FakeUpSomeRandomCrapEvent(obj, true);
// }
function FakeUpSomeRandomCrapEvent(obj, bWantChildObjects) {
    var pszLogLevels = ["Stygian", "Low", "Medium", "High", "Stratospheric"];
    var pszNames = [
        "Waiting in the toolshed.",
        "On the bus.",
        "Double bourbon.",
        "Not you, her.",
        "Interesting hobbies.",
        "My flippers came off.",
        "Were they good ones?",
        "Sorry, I never let anyone near my equipment.",
        "Why don't you put a sock in it.",
        "Virgo.",
        "Will you stay out of this?"
    ];
    var pszEvents = [
        "Moved right",
        "Moved left",
        "Moved up",
        "Moved down",
        "Shot bad guy",
        "Saved Lorna",
        "Found Stas",
        "Killed Tylan",
        "Mortgaged immortal soul",
        "Drank Kool-Aid",
        "Completed indoctrination",
        "Gelded Moose"
    ];
    var pszEnvironments = [
        "Desert",
        "Paradise",
        "Orange County",
        "Perdition",
        "LA County",
        "Antarctica",
        "Middle-East",
        "CCCP",
        "The Sticks",
        "The Styx"
    ];
    var rnd = new DotNetishTypes_1.Random();
    obj.m_szName = pszNames[rnd.Next(pszNames.length)];
    obj.m_dictMeta.Add("galaxy", "Lousy Day");
    obj.m_dictMeta.Add("Squirrel", "Run Away");
    obj.m_dictMeta.Add("How many", "456");
    obj.m_dictMeta.Add("Some floating point", "456.789");
    obj.m_dictMeta.Add("Some really big floating point", "456.789e+36");
    obj.m_dictMeta.Add("Some really small floating point", "456.789e-36");
    obj.m_szEnvironment = pszEnvironments[rnd.Next(pszEnvironments.length)];
}
exports.FakeUpSomeRandomCrapEvent = FakeUpSomeRandomCrapEvent;
/// <summary>
/// Mainly state, but more general than that... whatever user wants but principally state info.
/// </summary>
function FakeUpSomeRandomCrapStorageData(obj) {
    var pszStorageEntries = [
        "Like", "Your", "Cousin", "Luigi", "Lasagna", "Jacob Plows, Fool!", "I don't like roast beef."
    ];
    var rnd = new DotNetishTypes_1.Random();
    var szKey;
    var szValue;
    obj.m_cdictData = new DotNetishTypes_1.iXRDictStrings();
    szKey = pszStorageEntries[rnd.Next(pszStorageEntries.length)];
    szValue = pszStorageEntries[rnd.Next(pszStorageEntries.length)];
    obj.m_cdictData.Add(szKey, szValue);
    szKey = pszStorageEntries[rnd.Next(pszStorageEntries.length)];
    szValue = pszStorageEntries[rnd.Next(pszStorageEntries.length)];
    obj.m_cdictData.Add(szKey, szValue);
}
exports.FakeUpSomeRandomCrapStorageData = FakeUpSomeRandomCrapStorageData;
;
function FakeUpSomeRandomCrapStorage(obj) {
    var pszNames = ["George", "Liquor", "American", "Dave", "Знать", "Here", "Richard", "Wagner", "Jonas", "Grumby"];
    var pszOrigins = ["system", "user"];
    var pszTags = ["pour", "the", "crimson", "in", "me", "Jimson"];
    var rnd = new DotNetishTypes_1.Random();
    var szKey;
    var szValue;
    var ixrData = new iXRLibCoreModel_1.iXRStorageData();
    obj.m_szKeepPolicy = (rnd.Next(3) == 0) ? "keepLatest" : "appendHistory";
    obj.m_szName = pszNames[rnd.Next(pszNames.length)];
    // ---
    FakeUpSomeRandomCrapStorageData(ixrData);
    obj.m_dsData.clear();
    //m_dsData.Add(ixrData);
    obj.m_dsData.emplace_front().m_dspIXRXXXs.emplace_front().m_cdictData.Add("Rock", "Roll");
    obj.m_dsData[0].m_dspIXRXXXs[0].m_cdictData.Add("Lemon", "Custard");
    // ---
    obj.m_szOrigin = pszOrigins[rnd.Next(pszOrigins.length)];
    obj.m_bSessionData = (rnd.Next(3) == 0);
    // ---
    obj.m_lszTags.emplace_back(pszTags[rnd.Next(pszTags.length)]);
    obj.m_lszTags.emplace_back(pszTags[rnd.Next(pszTags.length)]);
}
exports.FakeUpSomeRandomCrapStorage = FakeUpSomeRandomCrapStorage;
/// <summary>
/// The Entity-Framework database object.
/// </summary>
function FakeUpSomeRandomCrapDbContext(obj) {
    var i;
    for (i = 0; i < 8; i++) {
        var objApplication = obj.m_dsIXRApplications.emplace_back();
        FakeUpSomeRandomCrapApplication(objApplication);
    }
    for (i = 0; i < 16; i++) {
        var objLog = obj.m_dsIXRLogs.emplace_back();
        FakeUpSomeRandomCrapLog(objLog);
    }
    for (i = 0; i < 16; i++) {
        var objEvent = obj.m_dsIXREvents.emplace_back();
        FakeUpSomeRandomCrapEvent(objEvent, true);
    }
    for (i = 0; i < 13; i++) {
        var objTelemetry = obj.m_dsIXRTelemetry.emplace_back();
        FakeUpSomeRandomCrapTelemetry(objTelemetry);
    }
    for (i = 0; i < 8; i++) {
        var objStorage = obj.m_dsIXRStorage.emplace_back();
        FakeUpSomeRandomCrapStorage(objStorage);
    }
}
exports.FakeUpSomeRandomCrapDbContext = FakeUpSomeRandomCrapDbContext;
//# sourceMappingURL=iXRLibCoreModelTests.js.map