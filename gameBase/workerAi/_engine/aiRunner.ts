/* define ai process sequence and tick */

import {jsonCopy} from "../../../script_base/util/json";
import {reqAnimFrameApi} from "../../../script_base/util/requestAnimationFrame";
import {AiEngine} from "./aiEngine";
import {iAiEngineProps} from "./aiEngine.type";
import {AiEvents} from "./aiEvents";
import {eAiRunnerEvent} from "./aiRunner.enum";
import {aiRunnerOptDefault, iAiRunnerProps} from "./aiRunner.type";


export class AiRunner {
    static create(options: iAiRunnerProps = {} as iAiRunnerProps) {

        const runner: iAiRunnerProps = Object.assign(jsonCopy(aiRunnerOptDefault), options);
        runner.delta = runner.delta || 1000 / runner.fps;
        runner.deltaMin = runner.deltaMin || 1000 / runner.fps;
        runner.deltaMax = runner.deltaMax || 1000 / (runner.fps * 0.5);
        runner.fps = 1000 / runner.delta;

        const _reqAnimFrameApi = reqAnimFrameApi(runner.fps);
        runner.reqAnimFrame = _reqAnimFrameApi.request;
        runner.cancelAnimFrame = _reqAnimFrameApi.cancel;

        return runner;
    }

    static run(runner: iAiRunnerProps, engine: iAiEngineProps) {
        function seqProcessor(time?) {
            runner.frameRequestId = runner.reqAnimFrame(seqProcessor);
            if (time && runner.enabled) {
                AiRunner.tick(runner, engine, time);
            }
        }

        seqProcessor()
    }

    static async tick(runner: iAiRunnerProps, engine: iAiEngineProps, time: number) {
        const timing = engine.timing;
        let correction = 1,
            delta;

        // create an event object
        const event = {
            timestamp: timing.timestamp
        };

        await AiEvents.trigger(runner, eAiRunnerEvent.beforeTick, event);

        if (runner.isFixed) {
            // fixed timestep
            delta = runner.delta;
        } else {
            // dynamic timestep based on wall clock between calls
            delta = (time - runner.timePrev) || runner.delta;
            runner.timePrev = time;

            // optimistically filter delta over a few frames, to improve stability
            runner.deltaHistory.push(delta);
            runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);
            delta = Math.min.apply(null, runner.deltaHistory);

            // limit delta
            delta = delta < runner.deltaMin ? runner.deltaMin : delta;
            delta = delta > runner.deltaMax ? runner.deltaMax : delta;

            // correction for delta
            correction = delta / runner.delta;

            // update engine timing object
            runner.delta = delta;
        }

        // time correction for time scaling
        if (runner.timeScalePrev !== 0)
            correction *= timing.timeScale / runner.timeScalePrev;

        if (timing.timeScale === 0)
            correction = 0;

        runner.timeScalePrev = timing.timeScale;
        runner.correction = correction;

        // fps counter
        runner.frameCounter += 1;
        if (time - runner.counterTimestamp >= 1000) {
            runner.fps = runner.frameCounter * ((time - runner.counterTimestamp) / 1000);
            runner.counterTimestamp = time;
            runner.frameCounter = 0;
        }

        await AiEvents.trigger(runner, eAiRunnerEvent.tick, event);

        // update
        await AiEvents.trigger(runner, eAiRunnerEvent.beforeUpdate, event);
        await AiEngine.update(engine, delta, correction);
        await AiEvents.trigger(runner, eAiRunnerEvent.afterUpdate, event);

        await AiEvents.trigger(runner, eAiRunnerEvent.afterTick, event);


        runner.tickId ++;
    }
}