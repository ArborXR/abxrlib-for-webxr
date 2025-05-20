type querymap = {
    [key: string]: string;
};
export declare class HTTP_URL {
    m_szScheme: string;
    m_szHost: string;
    m_szPort: string;
    m_szHostAndPort: string;
    m_nPort: number;
    m_vszPath: Array<string>;
    m_szQueryString: string;
    m_mapszQuery: querymap;
    TidyUp(): void;
    HostAndPort(): string;
}
export declare class URLParser {
    static Parse(input_url: string): HTTP_URL;
}
export {};
