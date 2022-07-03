/* this interface defines runner data object structure, not for AiRunner class */

export interface iAiEngineProps {
    timing: {
        timestamp: number,
        timeScale: number,
        lastDelta: number,
        lastElapsed: number,
    }
    events?: any[],
}


export const aiEnginePropsDefault: iAiEngineProps = {
    timing: {
        timestamp: 0,
        timeScale: 1,
        lastDelta: 0,
        lastElapsed: 0
    }
}