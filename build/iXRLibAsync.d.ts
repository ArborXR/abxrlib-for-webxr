import { iXRResult } from "./network/utils/DotNetishTypes";
export declare class iXRLibAsync {
    static m_nCallbackPeriodicity: number;
    static InitStatics(): void;
    AddTask(pfnTask: (o: any) => Promise<iXRResult>, pObject: any, pfnCleanup: (o: any) => void): Promise<iXRResult>;
}
