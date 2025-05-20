"use strict";
/// <summary>
/// MJP adapted from MIT licensed https://github.com/dongbum/URLParser/blob/master/src/
/// </summary>
//class URLParserFunction
//{
//public:
//	static bool FindKeyword(const std::string& input_url, size_t& st, size_t& before, const std::string& delim, std::string& result)
//	{
//		char	temp[1024] = { 0, };
//		size_t	temp_st = st;
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLParser = exports.HTTP_URL = void 0;
const types_1 = require("../types");
class HTTP_URL {
    constructor() {
        this.m_szScheme = "";
        this.m_szHost = "";
        this.m_szPort = "";
        this.m_szHostAndPort = ""; // Calculated.
        this.m_nPort = 0; // Calculated.
        this.m_vszPath = [];
        this.m_szQueryString = "";
        this.m_mapszQuery = {};
    }
    // ---
    // MJP:  Set defaults when certain fields are parsed as empty.
    TidyUp() {
        if (this.m_szScheme.length === 0) {
            if (this.m_szPort.length === 0) {
                this.m_szScheme = "http";
                this.m_szPort = "80";
            }
            else {
                this.m_szScheme = (this.m_szPort === "443") ? "https" : "http";
            }
        }
        if (this.m_szPort.length === 0) {
            this.m_szPort = (this.m_szScheme === "https") ? "443" : "80";
        }
        this.m_nPort = (0, types_1.atoi)(this.m_szPort);
    }
    HostAndPort() {
        this.m_szHostAndPort = `${this.m_szHost}:${this.m_nPort}`;
        // ---
        return this.m_szHostAndPort;
    }
}
exports.HTTP_URL = HTTP_URL;
;
class URLParser {
    static Parse(input_url) {
        let http_url = new HTTP_URL();
        const objURL = new URL(input_url);
        http_url.m_szScheme = objURL.protocol;
        http_url.m_szHost = objURL.hostname;
        http_url.m_szPort = objURL.port;
        http_url.m_vszPath = objURL.pathname.split("/");
        http_url.m_szQueryString = objURL.search;
        // ---
        if (objURL.search.length > 0) {
            for (const [key, value] of objURL.searchParams.entries()) {
                http_url.m_mapszQuery[key] = value;
            }
        }
        http_url.TidyUp();
        // ---
        return http_url;
    }
    ;
}
exports.URLParser = URLParser;
;
//# sourceMappingURL=URLParser.js.map