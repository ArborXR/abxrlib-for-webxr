"use strict";
/// <summary>
/// Main return code for library operations.
///		In here as it is needed by Task.
///		Co-maintained with the one in iXRInterop.cs.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.Task = exports.Random = exports.StringList = exports.iXRDictStrings = exports.Dictionary = exports.DateTime = exports.TimeSpan = exports.ConfigurationManager = exports.JsonResultToString = exports.JsonSuccess = exports.JsonResult = exports.ResultOptionsToString = exports.ResultOptions = exports.InteractionTypeToString = exports.InteractionType = exports.iXRResultToString = exports.iXRResult = void 0;
const types_1 = require("../types");
/// <summary>
/// Main return code for library operations.
///		In here as it is needed by Task.
///		Co-maintained with the one in iXRInterop.cs.
/// </summary>
var iXRResult;
(function (iXRResult) {
    // --- Unity compatible.
    iXRResult[iXRResult["eOk"] = 0] = "eOk";
    iXRResult[iXRResult["eNotInitialized"] = 1] = "eNotInitialized";
    iXRResult[iXRResult["eAnalyticsDisabled"] = 2] = "eAnalyticsDisabled";
    iXRResult[iXRResult["eTooManyItems"] = 3] = "eTooManyItems";
    iXRResult[iXRResult["eSizeLimitReached"] = 4] = "eSizeLimitReached";
    iXRResult[iXRResult["eTooManyRequests"] = 5] = "eTooManyRequests";
    iXRResult[iXRResult["eInvalidData"] = 6] = "eInvalidData";
    iXRResult[iXRResult["eUnsupportedPlatform"] = 7] = "eUnsupportedPlatform";
    // --- end Unity compatible.
    iXRResult[iXRResult["eEnableEventFailed"] = 8] = "eEnableEventFailed";
    iXRResult[iXRResult["eEventNotEnabled"] = 9] = "eEventNotEnabled";
    iXRResult[iXRResult["eEventCached"] = 10] = "eEventCached";
    iXRResult[iXRResult["eSendEventFailed"] = 11] = "eSendEventFailed";
    iXRResult[iXRResult["ePostObjectsFailed"] = 12] = "ePostObjectsFailed";
    iXRResult[iXRResult["ePostObjectsFailedNetworkError"] = 13] = "ePostObjectsFailedNetworkError";
    iXRResult[iXRResult["ePostObjectsBadJsonResponse"] = 14] = "ePostObjectsBadJsonResponse";
    iXRResult[iXRResult["eDeleteObjectsFailed"] = 15] = "eDeleteObjectsFailed";
    iXRResult[iXRResult["eDeleteObjectsFailedNetworkError"] = 16] = "eDeleteObjectsFailedNetworkError";
    iXRResult[iXRResult["eDeleteObjectsFailedDatabase"] = 17] = "eDeleteObjectsFailedDatabase";
    iXRResult[iXRResult["eDeleteObjectsBadJsonResponse"] = 18] = "eDeleteObjectsBadJsonResponse";
    iXRResult[iXRResult["eAuthenticateFailed"] = 19] = "eAuthenticateFailed";
    iXRResult[iXRResult["eAuthenticateFailedNetworkError"] = 20] = "eAuthenticateFailedNetworkError";
    iXRResult[iXRResult["eCouldNotObtainAuthSecret"] = 21] = "eCouldNotObtainAuthSecret";
    iXRResult[iXRResult["eCorruptJson"] = 22] = "eCorruptJson";
    iXRResult[iXRResult["eSetEnvironmentDataFailed"] = 23] = "eSetEnvironmentDataFailed";
    iXRResult[iXRResult["eObjectNotFound"] = 24] = "eObjectNotFound";
})(iXRResult = exports.iXRResult || (exports.iXRResult = {}));
;
function iXRResultToString(eRet) {
    switch (eRet) {
        case iXRResult.eNotInitialized:
            return "Not Initialized";
        case iXRResult.eAnalyticsDisabled:
            return "Analytics Disabled";
        case iXRResult.eTooManyItems:
            return "Too Many Items";
        case iXRResult.eSizeLimitReached:
            return "Size Limit Reached";
        case iXRResult.eTooManyRequests:
            return "Too Many Requests";
        case iXRResult.eInvalidData:
            return "Invalid Data";
        case iXRResult.eUnsupportedPlatform:
            return "Unsupported Platform";
        case iXRResult.eEnableEventFailed:
            return "Enable Event Failed";
        case iXRResult.eEventNotEnabled:
            return "Event Not Enabled";
        case iXRResult.eEventCached:
            return "Event Cached";
        case iXRResult.eSendEventFailed:
            return "Send Event Failed";
        case iXRResult.ePostObjectsFailed:
            return "Post Objects Failed";
        case iXRResult.ePostObjectsFailedNetworkError:
            return "Post Objects Failed Network Error";
        case iXRResult.ePostObjectsBadJsonResponse:
            return "Post Objects Bad Json Response";
        case iXRResult.eDeleteObjectsFailed:
            return "Delete Objects Failed";
        case iXRResult.eDeleteObjectsFailedNetworkError:
            return "Delete Objects Failed Network Error";
        case iXRResult.eDeleteObjectsFailedDatabase:
            return "Delete Objects Failed Database";
        case iXRResult.eDeleteObjectsBadJsonResponse:
            return "Delete Objects Bad Json Response";
        case iXRResult.eAuthenticateFailed:
            return "Authenticate Failed";
        case iXRResult.eAuthenticateFailedNetworkError:
            return "Authenticate Failed Network Error";
        case iXRResult.eCouldNotObtainAuthSecret:
            return "Could Not Obtain Auth Secret";
        case iXRResult.eCorruptJson:
            return "Corrupt JSON";
        case iXRResult.eSetEnvironmentDataFailed:
            return "Set Environment Data Failed";
        case iXRResult.eObjectNotFound:
            return "Object Not Found";
        default:
            return "Ok";
    }
    return "Ok";
}
exports.iXRResultToString = iXRResultToString;
/// <summary>
/// Used by EventInteractionComplete() as I write this... initially inspired by Scorm but set-union of all LMSes we support.
///		In here directly underneath iXRResult as it similarly occurs at all levels (including iXR.cs in iXRLibForUnity).
///		Co-maintained with the one in iXRInterop.cs.
/// </summary>
var InteractionType;
(function (InteractionType) {
    InteractionType[InteractionType["eNull"] = 0] = "eNull";
    InteractionType[InteractionType["eBool"] = 1] = "eBool";
    InteractionType[InteractionType["eSelect"] = 2] = "eSelect";
    InteractionType[InteractionType["eText"] = 3] = "eText";
    InteractionType[InteractionType["eRating"] = 4] = "eRating";
    InteractionType[InteractionType["eNumber"] = 5] = "eNumber";
})(InteractionType = exports.InteractionType || (exports.InteractionType = {}));
;
function InteractionTypeToString(eRet) {
    switch (eRet) {
        case InteractionType.eBool:
            return "Bool";
        case InteractionType.eSelect:
            return "Select";
        case InteractionType.eText:
            return "Text";
        case InteractionType.eRating:
            return "Rating";
        case InteractionType.eNumber:
            return "Number";
        default:
            break;
    }
    return "Null";
}
exports.InteractionTypeToString = InteractionTypeToString;
/// <summary>
/// In EventXXXComplete() functions.
///		Co-maintained with the one in iXRInterop.cs.
/// </summary>
var ResultOptions;
(function (ResultOptions) {
    ResultOptions[ResultOptions["eNull"] = 0] = "eNull";
    ResultOptions[ResultOptions["ePass"] = 1] = "ePass";
    ResultOptions[ResultOptions["eFail"] = 2] = "eFail";
    ResultOptions[ResultOptions["eComplete"] = 3] = "eComplete";
    ResultOptions[ResultOptions["eIncomplete"] = 4] = "eIncomplete";
})(ResultOptions = exports.ResultOptions || (exports.ResultOptions = {}));
;
function ResultOptionsToString(eRet) {
    switch (eRet) {
        case ResultOptions.eNull:
            return "Null";
        case ResultOptions.ePass:
            return "Pass";
        case ResultOptions.eFail:
            return "Fail";
        case ResultOptions.eComplete:
            return "Complete";
        case ResultOptions.eIncomplete:
            return "Incomplete";
        default:
            break;
    }
    return "Null";
}
exports.ResultOptionsToString = ResultOptionsToString;
/// <summary>
/// Result of JSON parsing operation(s).
/// </summary>
var JsonResult;
(function (JsonResult) {
    JsonResult[JsonResult["eOk"] = 0] = "eOk";
    JsonResult[JsonResult["eBadJsonStructure"] = 1] = "eBadJsonStructure";
    JsonResult[JsonResult["eMissingField"] = 2] = "eMissingField";
    JsonResult[JsonResult["eExtraneousField"] = 3] = "eExtraneousField";
    JsonResult[JsonResult["eFieldTypeNotSupported"] = 4] = "eFieldTypeNotSupported";
    JsonResult[JsonResult["eSingleObjectWhereListExpected"] = 5] = "eSingleObjectWhereListExpected";
    JsonResult[JsonResult["eListWhereSingleObjectExpected"] = 6] = "eListWhereSingleObjectExpected";
    JsonResult[JsonResult["eBoolFromDoubleNotSupported"] = 7] = "eBoolFromDoubleNotSupported";
    JsonResult[JsonResult["eSUIDFromBoolNotSupported"] = 8] = "eSUIDFromBoolNotSupported";
    JsonResult[JsonResult["eSUIDFromIntNotSupported"] = 9] = "eSUIDFromIntNotSupported";
    JsonResult[JsonResult["eSUIDFromDoubleNotSupported"] = 10] = "eSUIDFromDoubleNotSupported";
    JsonResult[JsonResult["eDictFromBoolNotSupported"] = 11] = "eDictFromBoolNotSupported";
    JsonResult[JsonResult["eDictFromIntNotSupported"] = 12] = "eDictFromIntNotSupported";
    JsonResult[JsonResult["eDictFromDoubleNotSupported"] = 13] = "eDictFromDoubleNotSupported";
    JsonResult[JsonResult["eStringListFromBoolNotSupported"] = 14] = "eStringListFromBoolNotSupported";
    JsonResult[JsonResult["eStringListFromIntNotSupported"] = 15] = "eStringListFromIntNotSupported";
    JsonResult[JsonResult["eStringListFromDoubleNotSupported"] = 16] = "eStringListFromDoubleNotSupported";
    JsonResult[JsonResult["eDateTimeFromBoolNotSupported"] = 17] = "eDateTimeFromBoolNotSupported";
    JsonResult[JsonResult["eDateTimeFromIntNotSupported"] = 18] = "eDateTimeFromIntNotSupported";
    JsonResult[JsonResult["eDateTimeFromDoubleNotSupported"] = 19] = "eDateTimeFromDoubleNotSupported";
    JsonResult[JsonResult["eTimeSpanFromBoolNotSupported"] = 20] = "eTimeSpanFromBoolNotSupported";
    JsonResult[JsonResult["eTimeSpanFromIntNotSupported"] = 21] = "eTimeSpanFromIntNotSupported";
    JsonResult[JsonResult["eTimeSpanFromDoubleNotSupported"] = 22] = "eTimeSpanFromDoubleNotSupported";
    JsonResult[JsonResult["eBinaryFromBoolNotSupported"] = 23] = "eBinaryFromBoolNotSupported";
    JsonResult[JsonResult["eBinaryFromIntNotSupported"] = 24] = "eBinaryFromIntNotSupported";
    JsonResult[JsonResult["eBinaryFromDoubleNotSupported"] = 25] = "eBinaryFromDoubleNotSupported";
    JsonResult[JsonResult["eDoubleFromBoolNotSupported"] = 26] = "eDoubleFromBoolNotSupported";
})(JsonResult = exports.JsonResult || (exports.JsonResult = {}));
;
function JsonSuccess(eRet) {
    return (eRet === JsonResult.eOk);
}
exports.JsonSuccess = JsonSuccess;
function JsonResultToString(eRet) {
    switch (eRet) {
        case JsonResult.eBadJsonStructure:
            return "Bad JSON Structure";
        case JsonResult.eMissingField:
            return "Missing Field";
        case JsonResult.eExtraneousField:
            return "Extraneous Field";
        case JsonResult.eFieldTypeNotSupported:
            return "Field Type Not Supported";
        case JsonResult.eSingleObjectWhereListExpected:
            return "Single Object Where List Expected";
        case JsonResult.eListWhereSingleObjectExpected:
            return "List Where Single Object Expected";
        case JsonResult.eBoolFromDoubleNotSupported:
            return "Bool From Double Not Supported";
        case JsonResult.eSUIDFromBoolNotSupported:
            return "SUID From Bool Not Supported";
        case JsonResult.eSUIDFromIntNotSupported:
            return "SUID From Int Not Supported";
        case JsonResult.eSUIDFromDoubleNotSupported:
            return "SUID From Double Not Supported";
        case JsonResult.eDictFromBoolNotSupported:
            return "Dict From Bool Not Supported";
        case JsonResult.eDictFromIntNotSupported:
            return "Dict From Int Not Supported";
        case JsonResult.eDictFromDoubleNotSupported:
            return "Dict From Double Not Supported";
        case JsonResult.eStringListFromBoolNotSupported:
            return "StringList From Bool Not Supported";
        case JsonResult.eStringListFromIntNotSupported:
            return "StringList From Int Not Supported";
        case JsonResult.eStringListFromDoubleNotSupported:
            return "StringList From Double Not Supported";
        case JsonResult.eDateTimeFromBoolNotSupported:
            return "DateTime From Bool Not Supported";
        case JsonResult.eDateTimeFromIntNotSupported:
            return "DateTime From Int Not Supported";
        case JsonResult.eDateTimeFromDoubleNotSupported:
            return "DateTime From Double Not Supported";
        case JsonResult.eBinaryFromBoolNotSupported:
            return "Binary From Bool Not Supported";
        case JsonResult.eBinaryFromIntNotSupported:
            return "Binary From Int Not Supported";
        case JsonResult.eBinaryFromDoubleNotSupported:
            return "Binary From Double Not Supported";
        case JsonResult.eDoubleFromBoolNotSupported:
            return "Double From Bool Not Supported";
        default:
            return "Ok";
    }
    return "Ok";
}
exports.JsonResultToString = JsonResultToString;
/// <summary>
/// Lean and mean Appconfig reader.
/// Assumes App.config is in current directory.
/// </summary>
class ConfigurationManager {
    // ---
    static DebugSetAppConfig(szAppConfig) {
        ConfigurationManager.m_szAppConfig = szAppConfig;
    }
    static AppSettings(szFieldName, szDefaultValue) {
        var szAppConfig = ConfigurationManager.m_szAppConfig;
        // if (szAppConfig.LoadFromFile("App.config"))
        if (szAppConfig.length > 0) {
            var csrszRegex;
            // ---
            csrszRegex = new RegExp(`<add[\\s]+key[\\s]*=[\\s]*"${szFieldName}"[\\s]+value[\\s]*=[\\s]*".*?"[\\s]*[/]?[\\s]*>`);
            // ---
            var vszMatches = [];
            // Filter out any HTML comments.  Note the non-greedy .*? which was not necessary in the C++ code.  Maybe back-port to C++ for consistency?
            vszMatches = types_1.Regex.ProgressiveMatch(szAppConfig, [/<\!\-\-.*?\-\->/i], [[true, /.*/i]]);
            for (const sz of vszMatches) {
                szAppConfig = szAppConfig.replace(sz, "");
            }
            // Now do the "real" match.
            vszMatches = types_1.Regex.DeepMatch(szAppConfig, [csrszRegex, /value[\s]*=[\s]*".*"[\s]*[/]?[\s]*>/], /value[\s]*=[\s]*"/, /"[\s]*[/]?[\s]*>/);
            if (vszMatches.length > 0) {
                return vszMatches[0];
            }
        }
        // ---
        return szDefaultValue;
    }
}
exports.ConfigurationManager = ConfigurationManager;
ConfigurationManager.m_szAppConfig = "";
;
/// <summary>
/// Lean and mean Appconfig reader.
/// Assumes App.config is in current directory.
/// </summary>
// MJP:  writing this comment in the middle of porting... probably not going to need this as it implies reading a file.  Get rid of it when sure.
// export class ConfigurationManager
// {
// 	static mstringb AppSettings(const char* szFieldName, const char* szDefaultValue)
// 	{
// 		mstringb	szAppConfig;
// 		if (szAppConfig.LoadFromFile("App.config"))
// 		{
// 			csrstringb	csrszRegex;
// 			// ---
// 			csrszRegex.Format(/<add[\s]+key[\s]*=[\s]*"%s"[\s]+value[\s]*=[\s]*".*"[\s]*[/]?[\s]*>/, szFieldName);
// 			// ---
// 			std::vector<mstringb>	vszMatches;
// 			// Filter out any HTML comments.
// 			Regex.ProgressiveMatch(szAppConfig, { /<\!\-\-.*\-\->/ }, { { true, /.*/ } }, vszMatches);
// 			for (const mstringb& sz : vszMatches)
// 			{
// 				szAppConfig.Replace(sz, "");
// 			}
// 			// Now do the "real" match.
// 			Regex.DeepMatch(szAppConfig, { csrszRegex, /value[\s]*=[\s]*".*"[\s]*[/]?[\s]*>/ }, /value[\s]*=[\s]*"/, /"[\s]*[/]?[\s]*>/, vszMatches);
// 			if (vszMatches.size() > 0)
// 			{
// 				return vszMatches[0];
// 			}
// 		}
// 		// ---
// 		return szDefaultValue;
// 	}
// };
/// <summary>
/// Data type that makes it easy to port C# Duration... double representation of seconds.  Easy to load/save to db,
///		debug, and easy enough to convert for adding to DateTime (below).
/// </summary>
class TimeSpan {
    // ---
    constructor() {
        this.m_dtDate = new Date();
    }
    Construct0(nHours, nMinutes, nSeconds) {
        this.m_dtDate = new Date((Math.floor(nHours) * 60.0 * 60.0 + Math.floor(nMinutes) * 60.0 + Math.floor(nSeconds)) * 1000.0);
        // ---
        return this;
    }
    Construct1(nDays, nHours, nMinutes, nSeconds) {
        this.m_dtDate = new Date((Math.floor(nDays) * 24.0 * 60.0 * 60.0 + Math.floor(nHours) * 60.0 * 60.0 + Math.floor(nMinutes) * 60.0 + Math.floor(nSeconds)) * 1000.0);
        // ---
        return this;
    }
    Construct2(d) {
        this.m_dtDate = new Date(d * 1000.0);
        // ---
        return this;
    }
    ToInt64() {
        return this.m_dtDate.getTime() / 1000.0;
    }
    get totalMilliseconds() {
        return this.m_dtDate.getTime();
    }
    ToMilliseconds() {
        return this.m_dtDate.getTime();
    }
    // Handles results of DateTime arithmetic.
    // TimeSpan(const std::chrono::system_clock::duration& dtDuration)
    // {
    // 	super::operator=(std::chrono::duration_cast<std::chrono::system_clock::duration, double, std::ratio<1, 1>>(dtDuration));
    // }
    // operator double()
    // {
    // 	return *reinterpret_cast<double*>(this);
    // }
    // operator const double() const
    // {
    // 	return *reinterpret_cast<const double*>(this);
    // }
    static Zero() {
        return new TimeSpan().Construct2(0);
    }
    static Parse(sz) {
        var tsRet = new TimeSpan();
        var vszMatches = [];
        vszMatches = types_1.Regex.ProgressiveMatch(sz, [], [
            [true, /[\d]/i], [false, /\./i],
            [true, /[\d]{2}/i], [false, /:/i],
            [true, /[\d]{2}/i], [false, /:/i],
            [true, /[\d]{2}/i]
        ]);
        if (vszMatches.length === 4) {
            // D.HH:MM:SS.
            tsRet = new TimeSpan().Construct1((0, types_1.atol)(vszMatches[0]), (0, types_1.atol)(vszMatches[1]), (0, types_1.atol)(vszMatches[2]), (0, types_1.atol)(vszMatches[3]));
        }
        else if (vszMatches.length === 1) {
            // Seconds.
            tsRet = new TimeSpan().Construct2((0, types_1.atol)(vszMatches[0]));
        }
        else {
            vszMatches = types_1.Regex.ProgressiveMatch(sz, [], [
                [true, /[\d]{2}/i], [false, /:/i],
                [true, /[\d]{2}/i], [false, /:/i],
                [true, /[\d]{2}/i]
            ]);
            if (vszMatches.length === 3) {
                // HH:MM:SS.
                tsRet = new TimeSpan().Construct0((0, types_1.atol)(vszMatches[0]), (0, types_1.atol)(vszMatches[1]), (0, types_1.atol)(vszMatches[2]));
            }
            else {
                tsRet = TimeSpan.Zero();
            }
        }
        // ---
        return tsRet;
    }
    ToString() {
        var szRet = "";
        szRet = (this.m_dtDate.getMilliseconds() * 1000).toString();
        // ---
        return szRet;
    }
    ToDateTime() {
        return new Date(this.m_dtDate.getTime());
    }
    FromUnixTime(nTime) {
        this.m_dtDate = new Date(nTime * 1000.0);
        // ---
        return this;
    }
}
exports.TimeSpan = TimeSpan;
;
function FixedDigits(n, nDigits) {
    return n.toString().padStart(nDigits, '0');
}
/// <summary>
/// Datatype that makes it easy to port C# DateTime.
/// </summary>
class DateTime extends Date {
    static Now() {
        return super.now();
    }
    static MaxValue() {
        // Let them deal with the headset apocalypse when the y2224 bug happens.
        const dt = new DateTime();
        dt.setFullYear(types_1.DATEMAXVALUE);
        // ---
        return dt;
    }
    static MinValue() {
        const dt = new DateTime();
        dt.setFullYear(types_1.DATEMINVALUE);
        // ---
        return dt;
    }
    /// <summary>
    /// Core constructor.
    ///		Constructs to local time... i.e. ToLocalTimeString() will yield exactly what was constructed here
    ///		whereas ToUtcTimeString() will timezone-convert from what is passed in here.
    /// </summary>
    /// <param name="nYear">Year, i.e. 1957 indicates the year 1957</param>
    /// <param name="nMonth">1-based</param>
    /// <param name="nDay">1-based</param>
    /// <param name="nHour">0-based</param>
    /// <param name="nMinute">0-based</param>
    /// <param name="nSecond">0-based</param>
    /// <param name="nMilliseconds">0-based</param>
    constructor(nYear, nMonth, nDay, nHour, nMinute, nSecond, nMilliseconds) {
        if (nYear !== undefined) {
            if (nMonth === undefined)
                nMonth = 0;
            if (nDay === undefined)
                nDay = 1;
            if (nHour === undefined)
                nHour = 0;
            if (nMinute === undefined)
                nMinute = 0;
            if (nSecond === undefined)
                nSecond = 0;
            if (nMilliseconds === undefined)
                nMilliseconds = 0;
            const dtLocalTime = new Date(nYear, nMonth, nDay, nHour, nMinute, nSecond, nMilliseconds);
            const dtUtcTime = new Date(dtLocalTime.getTime() + dtLocalTime.getTimezoneOffset() * 60000);
            // ---
            super(dtUtcTime);
        }
        else {
            super();
        }
    }
    // ---
    ToLocalTimeString() {
        return super.toLocaleString();
    }
    ToUtcTimeString() {
        return `${FixedDigits(this.getUTCFullYear(), 4)}-${FixedDigits(this.getUTCMonth() + 1, 2)}-${FixedDigits(this.getUTCDate(), 2)} ${FixedDigits(this.getUTCHours(), 2)}:${FixedDigits(this.getUTCMinutes(), 2)}:${FixedDigits(this.getUTCSeconds(), 2)}.${FixedDigits(this.getUTCMilliseconds(), 3)}`;
    }
    ToString() {
        return this.ToUtcTimeString();
    }
    ToUnixTime() {
        return super.getTime();
    }
    ToInt64() {
        return super.getTime();
    }
    ToUnixTimeAsString() {
        return Math.floor(super.getTime() / 1000).toString();
    }
    FromUnixTime(nTime) {
        super.setTime(nTime);
        // ---
        return this;
    }
    FromInt64(nTime) {
        super.setTime(nTime);
        // ---
        return this;
    }
    // Cannot overload static and non-static, hence this slight inelegancy.
    static ConvertUnixTime(nTime) {
        var dt = new DateTime();
        dt.FromUnixTime(nTime);
        // ---
        return dt;
    }
    // Calls core constructor therefore follows same convention (local / UTC)... referring to constructor
    // rather than saying what the constructor does here as it is too easy to forget to update this as
    // any change to the constructor is likely to be a hasty fix.
    static Parse(sz) {
        return new Date(super.parse(sz));
    }
}
exports.DateTime = DateTime;
;
/// <summary>
/// Datatype that makes it easy to port C# Dictionary<>-using code.
/// </summary>
/// <typeparam name="KEY">Key type.</typeparam>
/// <typeparam name="VALUE">Value type.</typeparam>
class Dictionary extends Map {
    // private m_vItems: Map<KEY, VALUE>;
    // private m_vItems: { [key: KEY]: VALUE };
    // ---
    constructor() {
        super();
        //this = {};
    }
    Add(kKey, vValue) {
        super.set(kKey, vValue);
    }
    Remove(kKey) {
        return this.delete(kKey);
    }
    Count() {
        return this.size;
    }
    TryGetValue(kKey, refparam) {
        var vValue = this.get(kKey);
        if (vValue != undefined) {
            refparam.vRet = vValue;
            // ---
            return true;
        }
        // ---
        return false;
    }
    ToString() {
        var szRet = "";
        for (let entry of this.entries()) {
            if (szRet.length > 0) {
                szRet += ',';
            }
            szRet += entry[0];
            szRet += '=';
            szRet += entry[1];
        }
        // ---
        return szRet;
    }
    LoadFromJson() {
        var eRet = JsonResult.eOk, eTestRet;
        // super::clear();
        // for (detail::iteration_proxy_value<detail::iter_impl<const json>> it = jsontree.items().begin(); it != jsontree.items().end(); ++it)
        // {
        // 	eTestRet = LoadFromJsonGuts(it.value());
        // 	if (eTestRet != JsonResult::eOk)
        // 	{
        // 		eRet = eTestRet;
        // 	}
        // }
        // ---
        return eRet;
    }
    JSONstringify() {
        const objThis = Object.fromEntries(this);
        return JSON.stringify(objThis);
    }
}
exports.Dictionary = Dictionary;
;
/// <summary>
/// The specific Dictionary<mstringb, mstringb>, which makes it easy to convert comma-separated string to dictionary of strings.
/// </summary>
class iXRDictStrings extends Dictionary {
    constructor() {
        super();
    }
    Construct(szCommaSeparatedNameEqualsValueList) {
        this.FromCommaSeparatedList(szCommaSeparatedNameEqualsValueList);
        // ---
        return this;
    }
    FromCommaSeparatedList(szCommaSeparatedNameEqualsValueList) {
        this.CommaSeparatedStringToDictionary(szCommaSeparatedNameEqualsValueList);
        // ---
        return this;
    }
    GenerateJson() {
        var szRet = "";
        for (const [key, value] of this.entries()) {
            if (szRet.length > 0) {
                szRet += ',';
            }
            szRet += `"${key}":${iXRDictStrings.StringIfNotNumber(value)}`;
        }
        // ---
        return `{${szRet}}`;
    }
    static StringIfNotNumber(value) {
        if (typeof value === 'string') {
            if (value.trim() !== '') {
                const nValue = Number(value);
                if (!isNaN(nValue) && isFinite(nValue)) {
                    return nValue;
                }
            }
            return `"${value}"`;
        }
    }
    FromJsonFieldValue(szJsonFieldValue) {
        this.JsonFieldValueToDictionary(szJsonFieldValue);
        // ---
        return this;
    }
    // ---
    CommaSeparatedStringToDictionary(szDict) {
        var vsz = new Array;
        var szKey = "", szValue = "";
        this.clear();
        vsz = szDict.split(',');
        for (let sz of vsz.values()) {
            var vszEquals = new Array;
            vszEquals = sz.split('=');
            if (vszEquals.length >= 1) {
                szKey = vszEquals[0].trim();
                szValue = (vszEquals.length >= 2) ? vszEquals[1].trim() : "";
                super.Add(szKey, szValue);
            }
        }
    }
    JsonFieldValueToDictionary(szJsonFieldValue) {
        const objThis = JSON.parse(szJsonFieldValue);
        this.clear();
        for (const [key, value] of Object.entries(objThis)) {
            super.Add(key, value);
        }
    }
}
exports.iXRDictStrings = iXRDictStrings;
;
/// <summary>
/// For having a primary datatype among the self-describing datatypes (DataObjectBase.h).
/// </summary>
class StringList extends Array {
    constructor() {
        super();
    }
    // --- C#ish from C# port to C++.
    emplace_back(sz) {
        super.push(sz);
        // ---
        return sz;
    }
    emplace_front() {
        var sz = "";
        super.unshift(sz);
        // ---
        return sz;
    }
    FromCommaSeparatedList(szCommaSeparatedList) {
        this.CommaSeparatedStringToStringList(szCommaSeparatedList);
    }
    // ---
    JSONstringify() {
        return JSON.stringify(this);
    }
    LoadFromJson() {
        var eRet = JsonResult.eOk, eTestRet;
        // super::clear();
        // for (detail::iteration_proxy_value<detail::iter_impl<const json>> it = jsontree.items().begin(); it != jsontree.items().end(); ++it)
        // {
        // 	eTestRet = LoadFromJsonGuts(it.value());
        // 	if (eTestRet != JsonResult::eOk)
        // 	{
        // 		eRet = eTestRet;
        // 	}
        // }
        // ---
        return eRet;
    }
    ToString() {
        var szRet = "";
        for (let sz of this.entries()) {
            if (szRet.length > 0) {
                szRet += ',';
            }
            szRet += sz;
        }
        // ---
        return szRet;
    }
    // ---
    CommaSeparatedStringToStringList(szStringList) {
        var vsz;
        // No doubt better way to do this.
        while (this.length > 0) {
            this.pop();
        }
        vsz = szStringList.split(',');
        // Probably better way to do this as well, something similar to this.push(vsz.values()) which is unkosher apparently.
        for (let sz of vsz.values()) {
            this.push(sz);
        }
    }
}
exports.StringList = StringList;
;
/// <summary>
/// Analogous to .NET Random object.
/// </summary>
class Random {
    Next(nFirst, nLast) {
        if (nFirst != null && nFirst != undefined) {
            if (nLast != null && nLast != undefined) {
                return (nLast <= nFirst) ? nFirst : Math.floor(Math.random() * (nLast - nFirst) + nFirst);
            }
            else {
                return Math.floor(Math.random() * nFirst);
            }
        }
        return 0;
    }
    NextBytes(mbBytes) {
        for (let b of mbBytes.values()) {
            b = Math.floor(Math.random() * 256);
        }
    }
}
exports.Random = Random;
;
/// <summary>
/// Analogous to .NET Task with just enough functionality for our purposes... basically just needs
///		to encapsulate a function pointer and its data and be able to call it synchronously.
/// </summary>
class Task {
    // ---
    constructor(pfnTask, pObject, pfnCleanup) {
        this.m_pfnTask = undefined; // The task to be done.
        this.m_pObject = undefined; // The task data, iXREvent, list of events, etc.
        this.m_pfnCleanup = undefined; // How to clean up m_pObject.
        this.m_pfnTask = pfnTask;
        this.m_pObject = pObject;
        this.m_pfnCleanup = pfnCleanup;
    }
    RunSynchronously() {
        if (this.m_pfnTask != undefined) {
            this.m_pfnTask(this.m_pObject);
        }
        if (this.m_pfnCleanup != undefined) {
            this.m_pfnCleanup(this.m_pObject);
        }
    }
}
exports.Task = Task;
;
/// <summary>
/// Analogous to .NET Queue<> with enough functionality for our purposes (Queue of Task).
/// </summary>
/// <typeparam name="T">Type of object being queued</typeparam>
//export class Queue<T> extends Array<T>
//{
//	public Enqueue(t: T): T
//	{
//		// Probably more efficient way to implement this.
//		return this[super.push(t) - 1];
//	}
//	Dequeue(): T
//	{
//		if (super.length > 0)
//		{
//			var	t: T|undefined = this.shift();
//			// ---
//			return (t) ? t : new T();
//		}
//		return new T();
//	}
//};
class Queue {
    constructor() {
        this.items = [];
    }
    // ---
    Enqueue(item) {
        this.items.push(item);
        // ---
        return item;
    }
    Dequeue() {
        return this.items.shift();
    }
    Peek() {
        return this.items[0];
    }
    get length() {
        return this.items.length;
    }
    IsEmpty() {
        return this.items.length === 0;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=DotNetishTypes.js.map