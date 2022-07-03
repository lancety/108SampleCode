import {iObjectAttrNum} from "../../../moduleObject/objectAttr.type";
import {iABody, iABodyAttrs, iABodyOpts, iABodyState} from "./ABody.type";
import {epAPawnAttrs} from "./APawn.attr.enum";
import {int} from "../../../../script_base/util/number";
import {eAiAction} from "../../../moduleAction/action.enum";

export interface iAPawnOpts extends iABodyOpts {
}

export interface iAPawnState extends iABodyState{
    // ai behavior tree engine tick per actor
    tickBt?: boolean,       // switch bt tick on/off for an actor (actor is not active sometime)
    tickBtAwaitCount: int,  // counter - how many frames passed without tick

    /* server geckos */
    cachedPlayerAct?: Set<eAiAction>,  // triggered by player actor (player control action)
    cachedAiAct?: Set<eAiAction>,      // triggered by AI, or 3rd player action result (e.g. damage)
    // actionCachePassiveEffect: Set<eAction>,  // changes of attrs or state, etc. changes dont need render
}

export interface iAPawnAttrs extends iABodyAttrs {
    [epAPawnAttrs.epMax]: iObjectAttrNum,
    [epAPawnAttrs.ep]: iObjectAttrNum,
    [epAPawnAttrs.lifeMax]: iObjectAttrNum,
    [epAPawnAttrs.life]: iObjectAttrNum,
}

export interface iAPawn extends iABody {
    opts: iAPawnOpts,
    attrs: iAPawnAttrs,
    state: iAPawnState,
}