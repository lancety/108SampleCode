import {iObjectAttrNum} from "../../../moduleObject/objectAttr.type";
import {epACharacterAttrs} from "./ACharacter.attr.enum";
import {iAPawn, iAPawnAttrs, iAPawnOpts, iAPawnState} from "./APawn.type";
import {vector2} from "../../../../script_base/@type/graph";

export interface iACharacterOpts extends iAPawnOpts {

}

export interface iACharacterAttrs extends iAPawnAttrs {
    [epACharacterAttrs.moveState]?: iObjectAttrNum,
    [epACharacterAttrs.moveSpeed]: iObjectAttrNum,   // the character move speed (m/s), move, run calc base on this value

}

export interface iACharacterState extends iAPawnState {
    idlePos: vector2,   // the position cache before any special movement, e.g. start battle
}

export interface iACharacter extends iAPawn {
    opts: iACharacterOpts,
    attrs: iACharacterAttrs,
    state: iACharacterState,
}