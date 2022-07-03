import {consistNow} from "../../../script_base/util/date";
import {jsonCopy} from "../../../script_base/util/json";
import {aiScope} from "../../globalWorker/ai/aiScope";
import {epObjectKey} from "../../moduleObjectGroup/objectKey.type";
import {OGM} from "../../moduleObjectGroup/objectGroupMap";
import {iAActor} from "../_class/actorClass/AActor.type";
import {actorGroupClassRef} from "../_class/actorGroup/actorGroupClass.ref";
import {eAiEngineEvent} from "./aiEngine.enum";
import {aiEnginePropsDefault, iAiEngineProps} from "./aiEngine.type";
import {AiEvents} from "./aiEvents";
import {AThing} from "../_class/actorClass/AThing";

export class AiEngine {
    static create(options: iAiEngineProps = {} as iAiEngineProps) {
        const engine = Object.assign(jsonCopy(aiEnginePropsDefault), options);
        // extra stuff

        return engine;
    }

    static async update(engine: iAiEngineProps, delta, correction) {
        const startTime = consistNow();

        delta = delta || 1000 / 60;
        correction = correction || 1;

        const timing = engine.timing;

        // increment timestamp
        timing.timestamp += delta * timing.timeScale;
        timing.lastDelta = delta * timing.timeScale;

        // create an event object
        const event = {
            timestamp: timing.timestamp
        };

        await AiEvents.trigger(engine, eAiEngineEvent.beforeUpdate, event);

        // loop all actors
        OGM.loop(aiScope.actorObjMap, function(actor: iAActor) {
            actorGroupClassRef<AThing>(actor[epObjectKey.gp])?.tick(actor);
        })

        await AiEvents.trigger(engine, eAiEngineEvent.afterUpdate, event);

        // log the time elapsed computing this update
        engine.timing.lastElapsed = consistNow() - startTime;

        return engine;
    }
}
