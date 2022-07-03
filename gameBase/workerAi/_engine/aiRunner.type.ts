/* this interface defines runner data object structure, not for AiRunner class */

export interface iAiRunnerProps {
    tickId: number,
    fps?: number,
    correction?: number,
    deltaSampleSize?: number,
    counterTimestamp?: number,
    frameCounter?: number,      // count how many frames in past 1000 ms
    deltaHistory?: number[],
    timePrev?: number,
    timeScalePrev?: number,
    frameRequestId?: number,    // requireAnimationFrame returned id
    isFixed?: boolean,
    enabled?: boolean,

    delta?: number,
    deltaMin?: number,
    deltaMax?: number,
    events?: any[],

    reqAnimFrame?,
    cancelAnimFrame?,
}

export const aiRunnerOptDefault: iAiRunnerProps = {
    tickId: 0,
    fps: 60,
    correction: 1,
    deltaSampleSize: 60,
    counterTimestamp: 0,
    frameCounter: 0,
    deltaHistory: [],
    timePrev: null,
    timeScalePrev: 1,
    frameRequestId: null,
    isFixed: false,
    enabled: true
}