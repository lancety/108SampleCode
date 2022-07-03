// similar like AActor, it never change position

import {AActor} from "./AActor";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {iASensor, iASensorOpts} from "./ASensor.type";

export abstract class ASensor<A extends iASensor = iASensor, O extends iASensorOpts = iASensorOpts> extends AActor<A, O> {

    protected _initOpts(actor: A, opts: O) {
        super._initOpts(actor, opts);

        actor.opts.abGroup = eActorBaseGroup.sensor;
    }
}