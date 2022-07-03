import {ASensor} from "./ASensor";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {iASensorBind, iASensorBindOpts} from "./ASensorBind.type";

export class ASensorBind<A extends iASensorBind = iASensorBind, O extends iASensorBindOpts = iASensorBindOpts> extends ASensor {

    protected _initOpts(actor: A, opts: O) {
        super._initOpts(actor, opts);

        actor.opts.abGroup = eActorBaseGroup.sensorBind;
    }
}