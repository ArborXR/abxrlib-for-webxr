"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.EnsureSingleEndingCharacter = exports.atof = exports.atoi = exports.atobool = exports.atol = exports.Regex = exports.SUID = exports.CurlHttp = exports.Verb = exports.SyncEvent = exports.ScopeThreadBlock = exports.IsClass = exports.Sleep = exports.JsonScalarArrayElement = exports.Base64 = exports.SIZE_MAX = exports.DEFAULTNAME = exports.DATEMINVALUE = exports.DATEMAXVALUE = void 0;
const guid_typescript_1 = require("guid-typescript");
const DataObjectBase_1 = require("./utils/DataObjectBase");
exports.DATEMAXVALUE = 2222;
exports.DATEMINVALUE = 1972;
exports.DEFAULTNAME = "state";
exports.SIZE_MAX = Number.MAX_SAFE_INTEGER;
class Base64 {
}
exports.Base64 = Base64;
Base64.Decode = (str) => Buffer.from(str, 'base64url');
Base64.Encode = (buf) => Buffer.from(buf).toString('base64url');
class JsonScalarArrayElement extends (_b = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_data = null;
    }
    // ---
    GetMapProperties() {
        return JsonScalarArrayElement.m_mapProperties;
    }
}
exports.JsonScalarArrayElement = JsonScalarArrayElement;
_a = JsonScalarArrayElement;
// ---
JsonScalarArrayElement.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_b, "m_mapProperties", _a).m_rfp, { m_data: new DataObjectBase_1.FieldProperties("data") }));
function Sleep(nMilliseconds) {
    return new Promise(resolve => setTimeout(resolve, nMilliseconds));
}
exports.Sleep = Sleep;
function IsClass(value) {
    return typeof value === 'function' && value.prototype !== undefined;
}
exports.IsClass = IsClass;
class ScopeThreadBlock {
    // ---
    constructor(cs) {
        this.m_cs = cs;
    }
    // ---
    Enter() {
        // Atomics.wait(this.m_cs, 0, 0, 0);
    }
    Leave() {
        // this.m_cs.unlock();
    }
}
exports.ScopeThreadBlock = ScopeThreadBlock;
class SyncEvent {
    constructor() {
        this.m_bEvent = false;
    }
    // ---
    SetEvent() {
        this.m_bEvent = true;
    }
    async Wait() {
        while (!this.m_bEvent) {
            await Sleep(100);
        }
    }
}
exports.SyncEvent = SyncEvent;
var Verb;
(function (Verb) {
    Verb[Verb["eGet"] = 0] = "eGet";
    Verb[Verb["eDelete"] = 1] = "eDelete";
    Verb[Verb["eOptions"] = 2] = "eOptions";
    Verb[Verb["eHead"] = 3] = "eHead";
    Verb[Verb["ePost"] = 4] = "ePost";
    Verb[Verb["eHasBody"] = 4] = "eHasBody";
    Verb[Verb["ePut"] = 5] = "ePut";
    Verb[Verb["ePatch"] = 6] = "ePatch";
})(Verb = exports.Verb || (exports.Verb = {}));
;
/// <summary>
/// CURL-based HTTP client in the C++/TypeScript style.  Using Fetch API instead of CURL.
/// </summary>
class CurlHttp {
    // ---
    constructor() {
        this.m_objRequestHeaders = new Headers();
        this.m_objRequest = new Request("https://www.google.com");
        this.m_objResponse = new Response();
        this.m_szLastError = "";
    }
    AddHttpHeader(szName, szValue) {
        if (this.m_objRequestHeaders.has(szName)) {
            this.m_objRequestHeaders.set(szName, szValue);
        }
        else {
            this.m_objRequestHeaders.append(szName, szValue);
        }
    }
    AddHttpAuthHeader(szName, szValue) {
        this.m_objRequestHeaders.append("Authorization", `${szName} ${szValue}`);
    }
    Initialize(szUrl, vpszQueryParameters, eVerb, pmbBodyContent) {
        var szUrlWithQueryParameters = "";
        this.m_objResponse = new Response();
        // This does not work like it is supposed to.  Ёб твою мать.
        // this.m_objRequestHeaders.delete("connection");
        // this.m_objRequestHeaders.delete("sec-fetch-mode");
        this.AddHttpHeader("Connection", "close");
        // ---
        if (vpszQueryParameters.length !== 0) {
            var szQueryParams = "", szTemp = "";
            for (const [szKey, szValue] of vpszQueryParameters) {
                szTemp = `${(szQueryParams.length === 0) ? "" : "&"}${szKey}=${szValue}`;
                szQueryParams += szTemp;
            }
            szUrlWithQueryParameters = szUrl;
            szUrlWithQueryParameters += "?";
            szUrlWithQueryParameters += szQueryParams;
            szUrl = szUrlWithQueryParameters;
        }
        // --- Body content for POST-style verbs.
        if (pmbBodyContent) {
            var szBodyContent = ((pmbBodyContent) ? ((pmbBodyContent instanceof Buffer) ? pmbBodyContent.toString('utf-8') : pmbBodyContent) : "");
            // If eVerb not POST, custom set whatever body-content verb it is.
            switch (eVerb) {
                case Verb.ePut:
                    this.m_objRequest = new Request(szUrl, { method: "PUT", headers: this.m_objRequestHeaders, body: szBodyContent });
                    break;
                case Verb.ePatch:
                    this.m_objRequest = new Request(szUrl, { method: "PATCH", headers: this.m_objRequestHeaders, body: szBodyContent });
                    break;
                case Verb.ePost:
                    this.m_objRequest = new Request(szUrl, { method: "POST", headers: this.m_objRequestHeaders, body: szBodyContent });
                    break;
                default:
                    break;
            }
        }
        else {
            // If eVerb not GET, custom set whatever non-body-content verb it is.
            switch (eVerb) {
                case Verb.eDelete:
                    this.m_objRequest = new Request(szUrl, { method: "DELETE", headers: this.m_objRequestHeaders });
                    break;
                case Verb.eOptions:
                    this.m_objRequest = new Request(szUrl, { method: "OPTIONS", headers: this.m_objRequestHeaders });
                    break;
                case Verb.eHead:
                    this.m_objRequest = new Request(szUrl, { method: "HEAD", headers: this.m_objRequestHeaders });
                    break;
                case Verb.eGet:
                    this.m_objRequest = new Request(szUrl, { method: "GET", headers: this.m_objRequestHeaders });
                    break;
                default:
                    break;
            }
        }
        // ---
        return true;
    }
    async Get(szUrl, vpszQueryParameters, rpResponse) {
        try {
            if (this.Initialize(szUrl, vpszQueryParameters, Verb.eGet, null)) {
                const objResponse = await fetch(this.m_objRequest);
                rpResponse.szResponse = await objResponse.text();
                // ---
                return true;
            }
        }
        catch (error) {
            this.m_szLastError = error instanceof Error ? error.message : String(error);
            // ---
            return false;
        }
        return false;
    }
    async Post(szUrl, vpszQueryParameters, mbBodyContent, rpResponse) {
        try {
            if (this.Initialize(szUrl, vpszQueryParameters, Verb.ePost, mbBodyContent)) {
                const objResponse = await fetch(this.m_objRequest);
                rpResponse.szResponse = await objResponse.text();
                // ---
                return true;
            }
        }
        catch (error) {
            var eError = error;
            // var szCause:	string = eError.cause as string;
            // this.m_szLastError = `${error instanceof Error ? error.message : 'Fetch'} : ${String(error)}, cause ${(eError) ? String(eError.cause.ToString()) : 'unknown'}`;
            this.m_szLastError = `${error instanceof Error ? error.message : 'Fetch'} : ${String(error)}`;
            // ---
            return false;
        }
        return false;
    }
    async Delete(szUrl, vpszQueryParameters, rpResponse) {
        try {
            if (this.Initialize(szUrl, vpszQueryParameters, Verb.eDelete, null)) {
                const objResponse = await fetch(this.m_objRequest);
                rpResponse.szResponse = await objResponse.text();
                // ---
                return true;
            }
        }
        catch (error) {
            this.m_szLastError = error instanceof Error ? error.message : String(error);
            // ---
            return false;
        }
        return false;
    }
}
exports.CurlHttp = CurlHttp;
/// <summary>
/// GUID (globally-unique) conflicts with Windows(tm), UUID (universally-unique) also conflicts with a header file in Windows(tm).
/// SUID (solarsystemy-unique) does not conflict with anything.
/// </summary>
class SUID {
    // ---
    constructor() {
        this.m_guid = guid_typescript_1.Guid.create();
        this.Create();
    }
    // SUID(const SUID& o)
    // {
    // 	operator=(o);
    // }
    // SUID& operator=(const SUID& o)
    // {
    // 	memcpy(m_pnData, o.m_pnData, sizeof(m_pnData));
    // 	// ---
    // 	return *this;
    // }
    static hexStringToGuid(hexString) {
        // Check if the hex string is valid.
        if (!/^[0-9a-f]{32}$/i.test(hexString)) {
            throw new Error("Invalid hex string");
        }
        // Format the hex string into a GUID format.
        return '${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20)}';
    }
    Construct(szHexString) {
        this.m_guid = guid_typescript_1.Guid.parse(szHexString);
    }
    Create() {
        this.m_guid = guid_typescript_1.Guid.create();
    }
    FromHex(szHex) {
        this.Construct(szHex);
        // ---
        return this;
    }
    // ---
    // bool operator==(const SUID& o) const
    // {
    // 	return (*m_pnData === *o.m_pnData && m_pnData[1] === o.m_pnData[1]);
    // }
    // bool operator!=(const SUID& o) const
    // {
    // 	return !operator==(o);
    // }
    MakeNull() {
        this.m_guid = guid_typescript_1.Guid.createEmpty();
    }
    IsNull() {
        return this.m_guid.isEmpty();
    }
    // template <typename CHAR> void ParseHex(const CHAR* szHex)
    // {
    // 	static intptr_t	pnOffsets[] = { 3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 14, 15 };
    // 	uint8_t			*pThis = reinterpret_cast<uint8_t*>(this);
    // 	const intptr_t	*pn;
    // 	CHAR			szFiltered[33],
    // 					c;
    // 	const CHAR		*p;
    // 	CHAR			*d;
    // 	uint8_t			n;
    // 	// Filter out non-hex and normalize to capital.
    // 	for (p = szHex, d = szFiltered; *p && d < &szFiltered[32]; p++)
    // 	{
    // 		c = (sizeof(CHAR) === 1) ? (CHAR)toupper(*(const CHAR*)p) : (CHAR)towupper(*(const CHAR*)p);
    // 		if ((c >= CHAR('0') && c <= CHAR('9')) || (c >= CHAR('A') && c <= CHAR('F')))
    // 		{
    // 			*d++ = c;
    // 		}
    // 	}
    // 	*d = 0;
    // 	for (p = szFiltered, pn = pnOffsets; *p; )
    // 	{
    // 		n = ToHexByte<CHAR>(p);
    // 		pThis[*pn++] = n;
    // 	}
    // }
    // private static ToHexByte(const CHAR*& p): number
    // {
    // 	uint8_t	n = 0;
    // 	CHAR	c = *p++;
    // 	if (c)
    // 	{
    // 		n = (c >= CHAR('A')) ? c - CHAR('A') + 10 : c - CHAR('0');
    // 		c = *p++;
    // 		if (c)
    // 		{
    // 			n = (n << 4) | ((c >= CHAR('A')) ? c - CHAR('A') + 10 : c - CHAR('0'));
    // 		}
    // 	}
    // 	return n;
    // }
    /// <summary>
    /// Core ToString() function.  Coded it to memory layout on little-endian system.  May have to revisit later.
    /// For now, the ParseHex() and ToString() are symmetric in that (and every other) regard... only if some
    /// outside GUID parsing needs to interface will this possibly become a problem.
    /// </summary>
    /// <typeparam name="CHAR">char, wchar_t, TCHAR</typeparam>
    /// <param name="bJustHex">false = canonical with squiggleys and hyphens, true means just hex digits.</param>
    /// <returns>Hexified representation of GUID/UUID/SUID</returns>
    // private template <typename CHAR> basic_mstring<CHAR> ToStringGuts(const bool bJustHex) const
    // {
    // 	static intptr_t		pnOffsets[] = { 3, 2, 1, 0, -1, 5, 4, -1, 7, 6, -1, 8, 9, -1, 10, 11, 12, 13, 14, 15 };
    // 	const uint8_t		*pThis = reinterpret_cast<const uint8_t*>(this);
    // 	basic_mstring<CHAR>	szRet;
    // 	CHAR				szHex[4];
    // 	if (!bJustHex)
    // 	{
    // 		szRet = (sizeof(CHAR) === 1) ? (CHAR*)"{" : (CHAR*)L"{";
    // 	}
    // 	for (const intptr_t nOffset : pnOffsets)
    // 	{
    // 		if (nOffset >= 0)
    // 		{
    // 			(sizeof(CHAR) === 1) ? sprintf_s<cardinalityof(szHex)>((char(&)[4])szHex, "%02X", pThis[nOffset]) : swprintf_s<cardinalityof(szHex)>((wchar_t(&)[4])szHex, L"%02X", pThis[nOffset]);
    // 			szRet += szHex;
    // 		}
    // 		else if (!bJustHex)
    // 		{
    // 			szRet += (sizeof(CHAR) === 1) ? (CHAR*)"-" : (CHAR*)L"-";
    // 		}
    // 	}
    // 	if (!bJustHex)
    // 	{
    // 		szRet += (sizeof(CHAR) === 1) ? (CHAR*)"}" : (CHAR*)L"}";
    // 	}
    // 	// ---
    // 	return szRet;
    // }
    ToString() {
        // return ToStringGuts<CHAR>(false);
        return this.m_guid.toString();
    }
    ToStringPureHex() {
        // Remove curly braces and hyphens from standard GUID string.
        return this.m_guid.toString().replace(/[{}-]/g, '');
    }
}
exports.SUID = SUID;
;
class Regex {
    // Simple... is there a match anywhere in the string.
    static Contains(data, regex) {
        return regex.test(data);
    }
    // First match from the beginning of the string, if any.
    static FirstMatch(szData, rxRegex) {
        const raMatch = szData.toString().match(rxRegex);
        if (!raMatch) {
            return null;
        }
        return { match: raMatch[0], range: [raMatch.index, raMatch.index + raMatch[0].length] };
    }
    /// <summary>
    ///		Drill down regexing through vrxszRegexLevels... i.e. vrxszRegexLevels[0] produces an array of matches, for each of those run vrxszRegexLevels[1], for each of those...
    ///		Then take the non-empty leaf node(s) and chew through using pbrxszRegexes, tossing the ones with false in the pair, accruing the ones with true in the pair.
    /// </summary>
    /// <param name="szData">String in which to search for matches</param>
    /// <param name="vrxszRegexLevels">Regular expressions to drill down into desired matches... i.e. first level acquires set of matches, second level matches into those, third level matches into second level...
    ///									^^^ Suggest making any regex that looks for anything enclosed by open-whatever desired-match close-whatever non-greedy.
    ///									That is, "open-whatever.*?close-whatever" not "open-whatever.*close-whatever".  Cost alot of debug time in TypeScript
    ///									due to plenty of other McGuffins.</param>
    /// <param name="pbrxszRegexes">pairs of <bool, regex-string> to chew through the matches from vrxszRegexLevels... keep the true ones, discard the false ones</param>
    /// <param name="vszMatches">Matches from the true pbrxszRegexes</param>
    /// <returns>true if there are matches, false if empty set</returns>
    static ProgressiveMatch(szData, vrxszRegexLevels, pbrxszFilterRegexes) {
        szData = szData.toString();
        // ---
        let vszCurrentMatches = [szData];
        const vszMatches = [];
        // Drill down through regex levels.
        for (var regex of vrxszRegexLevels) {
            const vszNextMatches = [];
            regex.lastIndex = 0;
            if (vszCurrentMatches.length === 0) {
                break;
            }
            for (const szText of vszCurrentMatches) {
                var raMatch = null;
                var szScratch = szText;
                while (raMatch = szScratch.match(regex)) {
                    vszNextMatches.push(raMatch[0]);
                    if (raMatch.index !== undefined) {
                        szScratch = szScratch.slice(raMatch.index + raMatch[0].length);
                    }
                }
            }
            vszCurrentMatches = vszNextMatches;
        }
        // Process final matches through filter regexes.
        for (const szText of vszCurrentMatches) {
            let szCurrentText = szText.toString();
            let bAllMatched = true;
            for (const [bKeep, rxRegex] of pbrxszFilterRegexes) {
                const szrMatch = this.FirstMatch(szCurrentText, rxRegex);
                if (!szrMatch) {
                    bAllMatched = false;
                    break;
                }
                if (bKeep) {
                    vszMatches.push(szrMatch.match);
                }
                szCurrentText = szCurrentText.slice(szrMatch.range[1]);
            }
        }
        return vszMatches;
    }
    /// <summary>
    /// Algorithm summary:
    ///		Drill down regexing through vrxszRegexLevels... i.e. vrxszRegexLevels[0] produces an array of matches, for each of those run vrxszRegexLevels[1], for each of those...
    ///		Then take the non-empty leaf node(s) and truncate rxszRegexPrefix and rxszPostFix and vszMatches are results of all of those.
    /// High-level summary:
    ///		Hone in on substrings per vrxszRegexLevels then get at the meat in between what is bracketing it on the left and right.
    /// </summary>
    /// <param name="szData">String in which to search for matches</param>
    /// <param name="vrxszRegexLevels">Regular expressions to drill down into desired matches... i.e. first level acquires set of matches, second level matches into those, third level matches into second level...</param>
    /// <param name="rxszRegexPrefix">On final level matches, lop off left to trim to absolute final match</param>
    /// <param name="rxszRegexPostfix">On final level matches, lop off right to trim to absolute final match</param>
    /// <param name="vszMatches">Bottom line matches from all of above</param>
    /// <returns>true if found any, false if empty set</returns>
    static DeepMatch(szData, vrxszRegexLevels, rxPrefixRegex, rxPostfixRegex) {
        let vszCurrentMatches = [szData];
        const vszMatches = [];
        // Drill down through regex levels.
        for (const rxszRegex of vrxszRegexLevels) {
            if (vszCurrentMatches.length === 0) {
                break;
            }
            const vszNextMatches = [];
            for (const szText of vszCurrentMatches) {
                const szFound = szText.match(new RegExp(rxszRegex, 'g')) || [];
                vszNextMatches.push(...szFound);
            }
            vszCurrentMatches = vszNextMatches;
        }
        // Process final matches - remove prefix and postfix.
        for (const szText of vszCurrentMatches) {
            const szPrefixMatch = this.FirstMatch(szText, rxPrefixRegex);
            const szStartIndex = szPrefixMatch ? szPrefixMatch.range[1] : 0;
            const szRemainingText = szText.slice(szStartIndex);
            const szPostfixMatch = this.FirstMatch(szRemainingText, rxPostfixRegex);
            const szEndIndex = szPostfixMatch ? szPostfixMatch.range[0] : szRemainingText.length;
            const szFinalMatch = szRemainingText.slice(0, szEndIndex);
            vszMatches.push(szFinalMatch);
        }
        return vszMatches;
    }
}
exports.Regex = Regex;
function atol(str) {
    return parseInt(str, 10);
}
exports.atol = atol;
function atobool(str) {
    return str === "true";
}
exports.atobool = atobool;
function atoi(str) {
    return parseInt(str, 10);
}
exports.atoi = atoi;
function atof(str) {
    return parseFloat(str);
}
exports.atof = atof;
function EnsureSingleEndingCharacter(str, ch) {
    if (str.endsWith(ch)) {
        return str;
    }
    return str + ch;
}
exports.EnsureSingleEndingCharacter = EnsureSingleEndingCharacter;
// ---
function logError(context, error) {
    console.error('=== Error ===');
    console.error(`Context: ${context}`);
    console.error('Message:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
    }
    else if (error.request) {
        console.error('Request:', error.request);
    }
    console.error('Stack:', error.stack);
    console.error('=============');
}
exports.logError = logError;
//# sourceMappingURL=types.js.map