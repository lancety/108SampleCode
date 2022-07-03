import {int} from "../../../../script_base/util/number";
import {iBlackboard} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/blackboard.type";
import {iPhysicsOpts} from "../../../modulePhysics/opts/physicsOpt.type";
import {iSpineComponentAttrs} from "../../_component/spineComponent/SpineComponent.type";
import {eObjectGroup} from "../../../moduleObjectGroup/objectGroup.enum";
import {iAThing, iAThingAttrs, iAThingOpts, iAThingState} from "./AThing.type";
import {iPhysicsComponentAttrs} from "../../_component/physicsComponent/PhysicsComponent.type";
import {eAiAction} from "../../../moduleAction/action.enum";
import {epActionEvent} from "../../../moduleAction/event/aiActionEvent.enum";

/**
 * for initiating actor instance, it is a combination of external pass in params and class default opt params
 */
interface iAActorOptsAutoFill {
    /**
     * delay duration before removing actor, it is greater than 0ms, required by:
     *  - destroyed animation,
     *  - destroyed status sync
     */
    removeDelay?: number,   // default value - actor 1000ms, characters 120s, players -1 never
}
export interface iAActorOpts extends iAActorOptsAutoFill, iAThingOpts, iPhysicsOpts {

}

/**
 * for replication between CS and game logic handler
 */
export interface iAActorAttrs extends iAThingAttrs, iPhysicsComponentAttrs, iSpineComponentAttrs {

}

/**
 * for ai logic to cache ai state
 */
export interface iAActorState extends iAThingState{
    bindChildGPs: eObjectGroup[],

    /**
     * only real action anim with duration (period action) need to set below values
     * then if the time is past, use action's trackLock to unlock any locked track
     */
    animTrackAction: eAiAction[],  // positive: action code run on this track; negative: action code block this track
    animTrackEnd: int[],     // lock end timestamp - used for unlock action tracks
    animTrackLock: boolean[],

    /**
     * a map maintain cool down of each sub action
     * number is tickId that will unlock the action
     */
    actCoolDownEnd: Map<eAiAction, number>,
    /**
     * a list of [tickId, actionEvent] for each aiAction that's active
     * when cancel action, delete the action from map
     * when ticking, loop throw each action array, stop looping if tickId larger than current ai engine tickId
     */
    actEventQueue: Map<eAiAction, Array<[number, epActionEvent]>>,
}

export interface iAActor extends iAThing {
    opts: iAActorOpts,
    attrs: iAActorAttrs,
    state: iAActorState,
    blackboard: iBlackboard,

    // cache - why not store actor ref?? - so it wont block actor garbage collection?? will be ok to use actor ref??
    collideStart: Set<iAActor>,
    collideEnd: Set<iAActor>,
    colliding: Set<iAActor>,

    bindChildActors: iAActor[],
}
