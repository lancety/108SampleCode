import {iObjectBase, iObjectBaseAttrs, iObjectBaseOpts, iObjectBaseState} from "../../../moduleObject/object.type";
import {eActorRenderStage, eActorSyncStage} from "./AActor.enum";
import {int} from "../../../../script_base/util/number";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {eActorTag} from "./_actorTag.enum";

export interface iAThingOpts extends iObjectBaseOpts {
    abGroup?: eActorBaseGroup,
    tags?: Set<eActorTag>,
}

export interface iAThingAttrs extends iObjectBaseAttrs {

}

export interface iAThingState extends iObjectBaseState {
    syncStage: eActorSyncStage,         // new -> physicsSynced -> renderSynced
    renderStage: eActorRenderStage,
    // ai runner tick
    tickIdLastUpdate?: int,     // attr last modified tick id - aiRunner.tickId
}

export interface iAThing extends iObjectBase {
    opts: iAThingOpts,
    attrs: iAThingAttrs,
    state: iAThingState,
}