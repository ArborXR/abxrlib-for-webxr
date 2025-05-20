"use strict";
/// <summary>
/// The object for handling the threading/tasking.
/// Queue main tasks and chew through them one at a time both for sequencing and not oversaturating bandwidth.
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRLibAsync = void 0;
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
/// </summary>
class iXRLibAsync {
    // ---
    static InitStatics() {
        iXRLibAsync.m_nCallbackPeriodicity = 500; // Half second.
    }
    // std::recursive_mutex	m_cs;
    // std::thread				m_tWorkerThread;
    // bool					m_bKeepRunning = true;
    // bool					m_bDestructed = false;
    // SyncEvent				m_seWakeUp;
    // Queue<Task>				m_qTasks;
    // TimerCallback			m_pfnTimerCallback = nullptr;
    // // ---
    // // Wake up on a singalling object and grab something to do out of queue.
    // // ---
    // // Alternately, do it with tasks and AwaitAny on the pending tasks.
    // iXRLibAsync(const TimerCallback& pfnTimerCallback) :
    // 	m_pfnTimerCallback(pfnTimerCallback),
    // 	m_tWorkerThread(ThreadMayn, this)
    // {
    // }
    // ~iXRLibAsync()
    // {
    // 	Dispose();
    // }
    // Client thread.
    async AddTask(pfnTask, pObject, pfnCleanup) {
        var objPromise = new Promise(async (resolve, reject) => {
            var eRet = await pfnTask(pObject);
            pfnCleanup(pObject);
            resolve(eRet);
        });
        // newscope
        // {
        // 	ScopeThreadBlock	cs(m_cs);
        // 	// MJP TODO:  deviceId etc is getting more complicated... make it a separate table.
        // 	m_qTasks.Enqueue(Task(pfnTask, pObject, pfnCleanup));
        // 	// Wake up the thread.
        // 	m_seWakeUp.SetEvent();
        // }
        return DotNetishTypes_1.iXRResult.eOk;
    }
}
exports.iXRLibAsync = iXRLibAsync;
;
//# sourceMappingURL=iXRLibAsync.js.map