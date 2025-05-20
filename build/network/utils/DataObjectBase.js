"use strict";
/// <summary>
/// Allows for several categories of object dumping each with rules for which fields to dump or filter.
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadFromJson = exports.GenerateJsonList = exports.GenerateJson = exports.GenerateJsonAlternate = exports.DbSet = exports.DbContext = exports.DataObjectBase = exports.FieldPropertiesRecordContainer = exports.FieldProperties = exports.FieldPropertyFlags = exports.JsonFieldType = exports.DumpCategory = void 0;
const types_1 = require("../types");
const DotNetishTypes_1 = require("./DotNetishTypes");
const iXRLibSQLite_1 = require("./iXRLibSQLite");
/// </summary>
var DumpCategory;
(function (DumpCategory) {
    DumpCategory[DumpCategory["eDumpEverything"] = 0] = "eDumpEverything";
    DumpCategory[DumpCategory["eDumpingJsonForBackend"] = 1] = "eDumpingJsonForBackend"; // Sending JSON to the backend, in which case we want to filter db fields (primary key etc).
})(DumpCategory = exports.DumpCategory || (exports.DumpCategory = {}));
;
/// <summary>
/// Due to the need to accommodate backend imprecision vis-a-vis object vs. array-of-object the object doing that has
///		an object and a list named the same thing.  Need to not dump the object to JSON.
/// </summary>
var JsonFieldType;
(function (JsonFieldType) {
    JsonFieldType[JsonFieldType["eField"] = 0] = "eField";
    JsonFieldType[JsonFieldType["eObject"] = 1] = "eObject";
    JsonFieldType[JsonFieldType["eObjectList"] = 2] = "eObjectList";
    JsonFieldType[JsonFieldType["eScalarList"] = 3] = "eScalarList";
})(JsonFieldType = exports.JsonFieldType || (exports.JsonFieldType = {}));
;
var FieldPropertyFlags;
(function (FieldPropertyFlags) {
    FieldPropertyFlags[FieldPropertyFlags["eOrdinaryColumn"] = 0] = "eOrdinaryColumn";
    FieldPropertyFlags[FieldPropertyFlags["bfNull"] = 0] = "bfNull";
    FieldPropertyFlags[FieldPropertyFlags["bfPrimaryKey"] = 1] = "bfPrimaryKey";
    FieldPropertyFlags[FieldPropertyFlags["bfParentKey"] = 2] = "bfParentKey";
    FieldPropertyFlags[FieldPropertyFlags["bfBackendAccommodation"] = 4] = "bfBackendAccommodation";
    FieldPropertyFlags[FieldPropertyFlags["bfNoEscapeJson"] = 8] = "bfNoEscapeJson";
    FieldPropertyFlags[FieldPropertyFlags["bfStringOnly"] = 16] = "bfStringOnly";
    FieldPropertyFlags[FieldPropertyFlags["bfChild"] = 32] = "bfChild";
    FieldPropertyFlags[FieldPropertyFlags["bfChildList"] = 64] = "bfChildList";
    FieldPropertyFlags[FieldPropertyFlags["bfExclude"] = 128] = "bfExclude";
})(FieldPropertyFlags = exports.FieldPropertyFlags || (exports.FieldPropertyFlags = {}));
class FieldProperties {
    // ---
    constructor(szName, fFlags, objChild) {
        this.m_szName = "";
        this.m_fFlags = FieldPropertyFlags.bfNull;
        this.m_objChild = null;
        this.m_szName = szName;
        this.m_fFlags = (fFlags) ? fFlags : FieldPropertyFlags.bfNull;
        this.m_objChild = objChild;
    }
    static JSONFieldName(rsfFieldProperties, szFieldName, fFlags) {
        for (const szKey in rsfFieldProperties) {
            if (szKey === szFieldName) {
                return rsfFieldProperties[szKey].m_szName;
            }
        }
        return "";
    }
}
exports.FieldProperties = FieldProperties;
class FieldPropertiesRecordContainer {
    // ---
    constructor(rfp) {
        this.m_objCurrentObject = null; // The object being dumped.
        this.m_nState = 0; // For generating unique names for objects and lists.
        this.m_aszAlreadySeen = new Array(); // Prevents re-entrancy stackfault.
        this.m_aszExcludedFields = new Array(); // Fields to exclude from the dump... extra fields that are not in the map m_rfp.
        this.m_bExcludedFieldsInitialized = false; // True if m_aszExcludedFields has been initialized.
        this.m_atpChildren = new Array(); // Objects that are children of the current object, accrued during the replacer function.
        this.m_atpListChildren = new Array(); // Lists that are children of the current object, accrued during the replacer function.
        this.replacer = (key, value) => {
            if (key === '') {
                // On the root object, create a new object with transformed keys.
                const result = {};
                for (const [szObjectKey, oObjectValue] of Object.entries(value)) {
                    const fpNode = this.m_rfp[szObjectKey];
                    const szJsonKey = (fpNode) ? fpNode.m_szName : szObjectKey;
                    const fFlags = (fpNode && fpNode.m_fFlags) ? fpNode.m_fFlags : FieldPropertyFlags.bfNull;
                    const bExclude = ((fFlags & (FieldPropertyFlags.bfExclude | FieldPropertyFlags.bfBackendAccommodation)) !== 0);
                    const bChild = ((fFlags & (FieldPropertyFlags.bfChild | FieldPropertyFlags.bfChildList)) !== 0);
                    const bStringOnly = ((fFlags & FieldPropertyFlags.bfStringOnly) !== 0);
                    if (bExclude || (!bChild && this.m_objCurrentObject && !this.m_objCurrentObject.ShouldDump(szJsonKey, JsonFieldType.eField, DumpCategory.eDumpingJsonForBackend))) {
                        result[szJsonKey] = undefined;
                    }
                    else if (oObjectValue instanceof DotNetishTypes_1.iXRDictStrings) {
                        const szInnerJson = (bStringOnly) ? oObjectValue.JSONstringify() : oObjectValue.GenerateJson();
                        result[szJsonKey] = JSON.parse(szInnerJson);
                    }
                    else if (oObjectValue instanceof DotNetishTypes_1.StringList) {
                        const szInnerJson = oObjectValue.JSONstringify();
                        result[szJsonKey] = JSON.parse(szInnerJson);
                    }
                    else if (oObjectValue instanceof types_1.SUID) {
                        result[szJsonKey] = oObjectValue.ToString();
                    }
                    else if (oObjectValue instanceof DotNetishTypes_1.DateTime) {
                        result[szJsonKey] = oObjectValue.ToString();
                    }
                    else {
                        result[szJsonKey] = oObjectValue;
                    }
                }
                return result;
            }
            else {
                var fpNode = null;
                Object.entries(this.m_rfp).forEach(([fKey, fValue]) => {
                    if (fValue.m_szName === key || fKey === key) {
                        fpNode = this.m_rfp[fKey];
                        return;
                    }
                });
                if (fpNode) {
                    if (fpNode.m_fFlags) {
                        // We know fpNode is not null at this point since we're in an if(fpNode) block.  We being the AI and us obsolete humans, but NOT apparently TypeScript.
                        // MJP:  Yes I am kind of pissed at this.  I'm not sure why I'm doing this.  I'm not sure why I'm not just using fpNode.  You said it AI (last bit autocompleted).
                        // CCW action... it was cool with this including when I was running tests and now it has whimsically decided to bitch about fpNode and fpNode.m_fFlags being null.
                        // Even with the null check on both.  Guess we need some gratuitous friction right at the end of getting it to build without errors.
                        const fpNodeThatBloodyWellIsNotNull = (fpNode) ? fpNode : new FieldProperties("", FieldPropertyFlags.bfNull);
                        const fFlags = (fpNodeThatBloodyWellIsNotNull.m_fFlags) ? fpNodeThatBloodyWellIsNotNull.m_fFlags : FieldPropertyFlags.bfNull;
                        const bExclude = ((fFlags & (FieldPropertyFlags.bfExclude | FieldPropertyFlags.bfBackendAccommodation)) !== 0);
                        const bChild = ((fFlags & (FieldPropertyFlags.bfChild | FieldPropertyFlags.bfChildList)) !== 0);
                        if (bExclude || (!bChild && this.m_objCurrentObject && !this.m_objCurrentObject.ShouldDump(key, JsonFieldType.eField, DumpCategory.eDumpingJsonForBackend))) {
                            return undefined;
                        }
                        else if (fFlags & FieldPropertyFlags.bfChild) {
                            if (!this.m_aszAlreadySeen.find(sz => sz === key)) {
                                const szState = "ГосударственныйОбъект" + this.m_nState++;
                                this.m_aszAlreadySeen.push(key);
                                this.m_atpChildren.push([szState, value]);
                                // ---
                                return szState;
                            }
                        }
                        else if (fFlags & FieldPropertyFlags.bfChildList) {
                            if (!this.m_aszAlreadySeen.find(sz => sz === key)) {
                                const szState = "ГосударственныйОбъект" + this.m_nState++;
                                this.m_aszAlreadySeen.push(key);
                                this.m_atpListChildren.push([szState, value]);
                                // ---
                                return szState;
                            }
                        }
                    }
                }
                else {
                    return (this.m_aszExcludedFields.find(sz => sz === key)) ? undefined : value;
                }
            }
            return value;
        };
        this.m_rfp = rfp;
    }
    LookupFieldProperties(szJsonFieldName) {
        for (const [szKey, fpNode] of Object.entries(this.m_rfp)) {
            if (fpNode.m_szName === szJsonFieldName) {
                return fpNode;
            }
        }
        return null;
    }
    static FromString(rObj, szJsonFieldValue) {
        switch (typeof rObj.obj[rObj.szKey]) {
            case 'string':
                rObj.obj[rObj.szKey] = szJsonFieldValue;
                break;
            case 'number':
                rObj.obj[rObj.szKey] = Number(szJsonFieldValue);
                break;
            case 'boolean':
                rObj.obj[rObj.szKey] = (szJsonFieldValue === 'true');
                break;
            case 'object':
                if (rObj.obj[rObj.szKey] instanceof DotNetishTypes_1.iXRDictStrings) {
                    rObj.obj[rObj.szKey] = new DotNetishTypes_1.iXRDictStrings().FromJsonFieldValue(szJsonFieldValue);
                }
                else if (rObj.obj[rObj.szKey] instanceof DotNetishTypes_1.StringList) {
                    rObj.obj[rObj.szKey] = new DotNetishTypes_1.StringList().FromCommaSeparatedList(szJsonFieldValue);
                }
                else if (rObj.obj[rObj.szKey] instanceof DotNetishTypes_1.TimeSpan) {
                    rObj.obj[rObj.szKey] = DotNetishTypes_1.TimeSpan.Parse(szJsonFieldValue);
                }
                else if (rObj.obj[rObj.szKey] instanceof DotNetishTypes_1.DateTime) {
                    rObj.obj[rObj.szKey] = DotNetishTypes_1.DateTime.Parse(szJsonFieldValue);
                }
                else if (rObj.obj[rObj.szKey] instanceof types_1.SUID) {
                    rObj.obj[rObj.szKey] = rObj.obj[rObj.szKey].FromHex(szJsonFieldValue);
                }
                break;
            default:
        }
    }
    LookupField(obj, szJsonFieldName) {
        var _c;
        var fpNode = this.LookupFieldProperties(szJsonFieldName);
        if (fpNode) {
            for (var [szKey, val] of Object.entries(obj)) {
                if (((_c = this.m_rfp[szKey]) === null || _c === void 0 ? void 0 : _c.m_szName) === szJsonFieldName) {
                    return { value: val, pfnSetter: (val) => { FieldPropertiesRecordContainer.FromString({ obj: obj, szKey: szKey }, val); } };
                }
            }
        }
        return null;
    }
    Reset(objCurrentObject) {
        this.m_objCurrentObject = objCurrentObject;
        this.m_nState = 0;
        this.m_aszAlreadySeen = new Array();
        this.m_atpChildren = new Array();
        this.m_atpListChildren = new Array();
        if (!this.m_bExcludedFieldsInitialized) {
            this.m_aszExcludedFields = new Array();
            this.m_bExcludedFieldsInitialized = true;
            for (const szKey in objCurrentObject) {
                if (this.m_rfp[szKey] === undefined) {
                    this.m_aszExcludedFields.push(szKey);
                }
            }
        }
    }
}
exports.FieldPropertiesRecordContainer = FieldPropertiesRecordContainer;
/// <summary>
/// Baseclass for anything that wants to load/save itself to SQLite db and/or JSON using the mechanisms in this header file.
/// </summary>
class DataObjectBase {
    constructor() {
        // --- OBJECT STATE.
        this.m_nLastLoadedSignature = -1;
        this.m_bFlaggedForDelete = false;
        this.m_bAlreadyTaken = false; // Database objects have to remain in memory until next SaveChanges() so this is how we Take() only not-previously-taken objects.
    }
    // ---
    GetMapProperties() {
        return DataObjectBase.m_mapProperties;
    }
    // ---
    /// <summary>
    /// DB model is like Entity Framework:  objects are operated on in memory then reflected in DB in large collective operation (SaveChanges()).
    ///		This flags an object for deletion on the next SaveChanges().
    /// </summary>
    /// <param name="bFlaggedForDelete">Turn on or off.</param>
    FlagForDelete(bFlaggedForDelete) {
        this.m_bFlaggedForDelete = bFlaggedForDelete;
    }
    // ---
    /// <summary>
    /// Overload this in a particular object when discretionary JSON field dumping/filtering is required for that object.
    /// </summary>
    /// <param name="szFieldName">Name of field... string compare to include/exclude.</param>
    /// <param name="eJsonFieldType">Field, object, object-list, scalar-list.</param>
    /// <param name="eDumpCategory">Everything or Backend as I write this... basically for what is this JSON intended.</param>
    /// <returns>Should this field be dumped, true/false.</returns>
    ShouldDump(szFieldName, eJsonFieldType, eDumpCategory) {
        return true;
    }
    /// <summary>
    /// Used by JsonScalarArrayElement to return pointer to contained data for the clause in
    ///		LoadFromJson() that loads those.
    /// </summary>
    /// <returns>void* pointer to contained data that will be cast by LoadFromJson() appropriately.</returns>
    GetData() {
        return null;
    }
    /// <summary>
    /// Any object that needs to post-process, typically converting a string to more meaningful data,
    ///		can overload this then it will get called by LoadFromJson().
    /// </summary>
    FinalizeParse() {
    }
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
    }
}
exports.DataObjectBase = DataObjectBase;
// --- END OBJECT STATE.
// When indicated by ObjectAttribute::eOutOfBandObject, any fields not found in the object
// being LoadFromJson()ed, instead of erroring with JsonResult::eMissingField, will get stuffed
// into here, and GenerateJson() will render the extra fields.
// iXRDictStrings	m_dictOutOfBandData;
// // ---
DataObjectBase.m_mapProperties = new FieldPropertiesRecordContainer(Object.assign({}, { m_nLastLoadedSignature: new FieldProperties("last_loaded_signature", FieldPropertyFlags.bfExclude) }, { m_bFlaggedForDelete: new FieldProperties("flagged_for_delete", FieldPropertyFlags.bfExclude) }, { m_bAlreadyTaken: new FieldProperties("already_taken", FieldPropertyFlags.bfExclude) }));
;
// ---
class DbContext extends (_b = DataObjectBase) {
    constructor() {
        super(...arguments);
        // public m_db:		SqliteDbConnection = new SqliteDbConnection();
        this.m_guidId = new types_1.SUID(); // Never actually gets dereferenced... needed so templates will instantiate as this object serves as a container for db objects.
    }
    // ---
    GetMapProperties() {
        return DbContext.m_mapProperties;
    }
    // ---
    SaveChanges() {
        return iXRLibSQLite_1.DatabaseResult.eOk;
    }
}
exports.DbContext = DbContext;
_a = DbContext;
// ---
DbContext.m_mapProperties = new FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_b, "m_mapProperties", _a).m_rfp, { m_guidId: new FieldProperties("Id", FieldPropertyFlags.bfPrimaryKey) }));
;
/// <summary>
/// Analogue of .NET DbSet<>... in here rather than DotNetishTypes.h as it is a core object needed by several functions in this header file.
/// </summary>
/// <typeparam name="T">Type of database object</typeparam>
class DbSet extends Array {
    //private m_tTypeCompare:	T;
    // ---
    constructor(ctor) {
        super();
        this.m_tTypeCompare = ctor;
    }
    ContainedType() {
        return this.m_tTypeCompare;
    }
    // --- C++/stl-ish from port from C++.
    empty() {
        return (super.length === 0);
    }
    clear() {
        super.length = 0;
    }
    erase(o) {
        super.splice(super.indexOf(o), 1);
    }
    // --- C#ish from C# port to C++.
    emplace_back() {
        var o = new this.m_tTypeCompare();
        super.push(o);
        // ---
        return o;
    }
    emplace_back_object(o) {
        super.push(o);
        // ---
        return o;
    }
    emplace_front() {
        var o = new this.m_tTypeCompare();
        super.unshift(o);
        // ---
        return o;
    }
    Add(o) {
        super.push(o);
        // ---
        return this[this.length - 1];
    }
    Count() {
        var nRet = 0;
        for (let t of this.values()) {
            if (!t.m_bAlreadyTaken && !t.m_bFlaggedForDelete) {
                nRet++;
            }
        }
        return nRet;
    }
    /// <summary>
    /// Like .NET List<T>.Count / stl-ish size().
    ///		Note that this is not the same as Count() which is the number of items in this not filtered by m_bAlreadyTaken or m_bFlaggedForDelete.
    ///		Generally use Count(), this is here to port a specific safety case from C++.
    /// </summary>
    /// <returns>Number of items in this not filtered by m_bAlreadyTaken or m_bFlaggedForDelete</returns>
    size() {
        return this.length;
    }
    RemoveAllRange() {
        for (let t of this.values()) {
            t.m_bFlaggedForDelete = true;
        }
    }
    RemoveRange(nFirst) {
        if (nFirst > 0) {
            for (let t of this.values()) {
                t.m_bFlaggedForDelete = true;
                nFirst--;
                if (nFirst === 0) {
                    break;
                }
            }
        }
    }
    /// <summary>
    /// Like Take() in .NET.
    /// </summary>
    /// <param name="nCount">How many... SIZE_MAX for all (and do not mark as taken in that case)</param>
    /// <returns>List of pointers to first <nCount> objects in this</returns>
    Take(nCount) {
        var lRet = new DbSet(this.m_tTypeCompare);
        var bMarkAsTaken = (nCount < Number.MAX_VALUE);
        if (nCount > 0) {
            for (let t of this.values()) {
                if (!t.m_bAlreadyTaken) {
                    lRet.push(t);
                    if (bMarkAsTaken) {
                        t.m_bAlreadyTaken = true;
                    }
                    nCount--;
                    if (nCount === 0) {
                        break;
                    }
                }
            }
        }
        // ---
        return lRet;
    }
}
exports.DbSet = DbSet;
;
function GenerateJsonAlternate(o, eDumpCategory, mpfnGenerateJsonAlternate) {
    var _c, _d;
    var szJSON = "";
    o.GetMapProperties().Reset(o);
    // Dump just this object's fields (replacer will filter the children and put objects in m_atpChildren and lists in m_atpListChildren).
    szJSON = JSON.stringify(o, o.GetMapProperties().replacer);
    // Replace the placeholders.
    for (const [szName, oChildObject] of o.GetMapProperties().m_atpChildren) {
        if (o.ShouldDump(szName, JsonFieldType.eObject, eDumpCategory)) {
            var szObjectJSON = "";
            const fnGenerateJsonAlternate = (_c = mpfnGenerateJsonAlternate.find(([szName, fn]) => szName === szName)) === null || _c === void 0 ? void 0 : _c[1];
            if (fnGenerateJsonAlternate) {
                szObjectJSON = fnGenerateJsonAlternate();
            }
            else {
                szObjectJSON = GenerateJson(oChildObject, eDumpCategory);
            }
            szJSON = szJSON.replace('"' + szName + '"', szObjectJSON);
        }
    }
    for (const [szName, oChildObjectList] of o.GetMapProperties().m_atpListChildren) {
        if (o.ShouldDump(szName, JsonFieldType.eObjectList, eDumpCategory)) {
            var szObjectListJSON = "";
            var bDidOne = false;
            const fnGenerateJsonAlternate = (_d = mpfnGenerateJsonAlternate.find(([szName, fn]) => szName === szName)) === null || _d === void 0 ? void 0 : _d[1];
            if (fnGenerateJsonAlternate) {
                szObjectListJSON = fnGenerateJsonAlternate();
            }
            else {
                szObjectListJSON = "[";
                for (const o of oChildObjectList) {
                    const szInnerJson = GenerateJson(o, eDumpCategory);
                    if (bDidOne) {
                        szObjectListJSON += ",";
                    }
                    bDidOne = true;
                    szObjectListJSON += szInnerJson;
                }
                szObjectListJSON += "]";
            }
            szJSON = szJSON.replace('"' + szName + '"', szObjectListJSON);
        }
    }
    o.FinalizeParse();
    // ---
    return szJSON;
}
exports.GenerateJsonAlternate = GenerateJsonAlternate;
function GenerateJson(o, eDumpCategory) {
    return GenerateJsonAlternate(o, eDumpCategory, []);
}
exports.GenerateJson = GenerateJson;
function GenerateJsonList(l, eDumpCategory) {
    var szJSON = "[";
    var bDidOne = false;
    for (const o of l) {
        const szInnerJson = GenerateJson(o, eDumpCategory);
        if (bDidOne) {
            szJSON += ",";
        }
        bDidOne = true;
        szJSON += szInnerJson;
    }
    szJSON += "]";
    // ---
    return szJSON;
}
exports.GenerateJsonList = GenerateJsonList;
function LoadFromJson(o, szJSON) {
    var objJsonObject = null;
    try {
        if (o !== null) {
            var objFieldProperties = o.GetMapProperties();
            objJsonObject = JSON.parse(szJSON);
            // objJsonObject = JSON.parse(JSON.stringify(JSON.parse(szJSON)));
            // objJsonObject = eval(szJSON);
            for (const [szField, szValue] of Object.entries(objJsonObject)) {
                var fpNode = objFieldProperties.LookupFieldProperties(szField);
                if (fpNode) {
                    const fpNodeThatBloodyWellIsNotNull = (fpNode) ? fpNode : new FieldProperties("", FieldPropertyFlags.bfNull);
                    const fFlags = (fpNodeThatBloodyWellIsNotNull.m_fFlags) ? fpNodeThatBloodyWellIsNotNull.m_fFlags : FieldPropertyFlags.bfNull;
                    const bExclude = (fFlags & FieldPropertyFlags.bfExclude) !== 0;
                    const bChild = ((fFlags & (FieldPropertyFlags.bfChild | FieldPropertyFlags.bfChildList)) !== 0);
                    if (!bExclude && !bChild) {
                        var objField = objFieldProperties.LookupField(o, szField);
                        if (objField !== null) {
                            objField.pfnSetter(szValue);
                        }
                    }
                    else {
                        if (fFlags & FieldPropertyFlags.bfChild) {
                            const objChild = objFieldProperties.LookupField(o, szField);
                            if (objChild !== null) {
                                LoadFromJson(objChild, szValue);
                            }
                        }
                    }
                }
                else {
                    return DotNetishTypes_1.JsonResult.eMissingField;
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        return DotNetishTypes_1.JsonResult.eBadJsonStructure;
    }
    // ---
    return DotNetishTypes_1.JsonResult.eOk;
}
exports.LoadFromJson = LoadFromJson;
//# sourceMappingURL=DataObjectBase.js.map