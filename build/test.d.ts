import { iXRBase } from './iXRLibCoreModel';
import { DataObjectBase, FieldPropertiesRecordContainer } from './network/utils/DataObjectBase';
export declare class iXRXXXTestScalarContainer<T extends DataObjectBase> extends iXRBase {
    m_tIXRXXX: T;
    constructor(tTypeOfT: any);
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
