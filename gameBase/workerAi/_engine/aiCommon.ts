export class AiCommon {
    static _nowStartTime = Date.now();
    static now() {
        if (globalThis.performance) {
            if (globalThis.performance.now) {
                return globalThis.performance.now();
            } else {
                // @ts-ignore
                if (globalThis.performance.webkitNow) {
                    // @ts-ignore
                    return globalThis.performance.webkitNow();
                }
            }
        }

        if (Date.now) {
            return Date.now();
        }

        return Date.now() - AiCommon._nowStartTime;
    }
}