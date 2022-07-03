import {LinkedListDouble} from "../../../../script_base/util/linkedListDouble";
import {
    iObjectAttrBool,
    iObjectAttrNum,
    iObjectAttrNumArray,
} from "../../../moduleObject/objectAttr.type";
import {iACABattleAttacker} from "../../_component/tickComponent/TCAction/ACABattle.type";
import {iAActor, iAActorAttrs, iAActorOpts, iAActorState} from "./AActor.type";
import {epABodyAttrs} from "./ABody.attr.enum";


export interface iABodyOpts extends iAActorOpts {

}

export interface iABodyAttrs extends iAActorAttrs {
    [epABodyAttrs.anim]: iObjectAttrNumArray,
    [epABodyAttrs.animTickId]: iObjectAttrNumArray,
    [epABodyAttrs.animDuration]: iObjectAttrNumArray,
    [epABodyAttrs.actCooldown]: iObjectAttrNum,

    [epABodyAttrs.hpMax]
    [epABodyAttrs.hp]: iObjectAttrNum,

    [epABodyAttrs.toolHittable]: iObjectAttrBool,
    [epABodyAttrs.status]: iObjectAttrNum,
    [epABodyAttrs.statusTimestamp]: iObjectAttrNum,
}


export interface iABodyState extends iAActorState {
    attackerList?: LinkedListDouble<iACABattleAttacker>, // only authority role & hitable actors have it
    attackerActive?: iACABattleAttacker,
}


export interface iABody extends iAActor {
    opts: iABodyOpts,
    attrs: iABodyAttrs,
    state: iABodyState,
}