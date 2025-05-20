import { SUID } from "../types";
import { JsonResult } from "./DotNetishTypes";
import { DatabaseResult } from "./iXRLibSQLite";
export declare enum DumpCategory {
    eDumpEverything = 0,
    eDumpingJsonForBackend = 1
}
export declare enum JsonFieldType {
    eField = 0,
    eObject = 1,
    eObjectList = 2,
    eScalarList = 3
}
export declare enum FieldPropertyFlags {
    eOrdinaryColumn = 0,
    bfNull = 0,
    bfPrimaryKey = 1,
    bfParentKey = 2,
    bfBackendAccommodation = 4,
    bfNoEscapeJson = 8,
    bfStringOnly = 16,
    bfChild = 32,
    bfChildList = 64,
    bfExclude = 128
}
export declare class FieldProperties {
    m_szName: string;
    m_fFlags: FieldPropertyFlags | null;
    m_objChild: any | null;
    constructor(szName: string, fFlags?: FieldPropertyFlags | null, objChild?: any | null);
    static JSONFieldName(rsfFieldProperties: Record<string, FieldProperties>, szFieldName: string, fFlags: number): string;
}
export declare class FieldPropertiesRecordContainer {
    m_objCurrentObject: any;
    m_rfp: Record<string, FieldProperties>;
    m_nState: number;
    m_aszAlreadySeen: Array<string>;
    m_aszExcludedFields: Array<string>;
    m_bExcludedFieldsInitialized: boolean;
    m_atpChildren: Array<[string, object]>;
    m_atpListChildren: Array<[string, object]>;
    constructor(rfp: Record<string, FieldProperties>);
    LookupFieldProperties(szJsonFieldName: string): FieldProperties | null;
    static FromString(rObj: {
        obj: any;
        szKey: string;
    }, szJsonFieldValue: string): void;
    LookupField(obj: any, szJsonFieldName: string): any | null;
    Reset(objCurrentObject: any): void;
    replacer: (key: string, value: any) => any;
}
export declare class DataObjectBase {
    m_nLastLoadedSignature: number;
    m_bFlaggedForDelete: boolean;
    m_bAlreadyTaken: boolean;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    FlagForDelete(bFlaggedForDelete: boolean): void;
    ShouldDump(szFieldName: string, eJsonFieldType: JsonFieldType, eDumpCategory: DumpCategory): boolean;
    GetData(): object | null;
    FinalizeParse(): void;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class DbContext extends DataObjectBase {
    m_guidId: SUID;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    SaveChanges(): DatabaseResult;
}
export declare class DbSet<T extends DataObjectBase> extends Array<T> {
    private m_tTypeCompare;
    constructor(ctor: new () => T);
    ContainedType(): any;
    empty(): boolean;
    clear(): void;
    erase(o: T): void;
    emplace_back(): T;
    emplace_back_object(o: T): T;
    emplace_front(): T;
    Add(o: T): T;
    Count(): number;
    size(): number;
    RemoveAllRange(): void;
    RemoveRange(nFirst: number): void;
    Take(nCount: number): DbSet<T>;
}
export declare function GenerateJsonAlternate(o: DataObjectBase, eDumpCategory: DumpCategory, mpfnGenerateJsonAlternate: Array<[string, () => string]>): string;
export declare function GenerateJson(o: DataObjectBase, eDumpCategory: DumpCategory): string;
export declare function GenerateJsonList(l: DbSet<DataObjectBase>, eDumpCategory: DumpCategory): string;
export declare function LoadFromJson(o: DataObjectBase | null, szJSON: string): JsonResult;
