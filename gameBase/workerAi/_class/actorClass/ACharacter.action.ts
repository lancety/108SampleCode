import {eBtTickStatus} from "../../../../script_module/behaviorEditor/src/behaviorTree/bt.enum";
import {eAbsAction} from "../../../moduleAction/action.enum";
import {eActCore, eActInteract} from "../../../moduleAction/action.enum";
import {aiActionAnimUtil} from "../../../moduleAction/anim/aiActionAnim.util";
import {ObjectAttr} from "../../../moduleObject/objectAttr";
import {TCAction} from "../../_component/tickComponent/TCAction";
import {ACABattleAttackee} from "../../_component/tickComponent/TCAction/ACABattleAttackee";
import {ACABattleAttacker, ACABattleAttackerMain} from "../../_component/tickComponent/TCAction/ACABattleAttacker";
import {epABodyAttrs} from "./ABody.attr.enum";
import {iACharacter} from "./ACharacter.type";
import {aiActions} from "../../../moduleAction/aiActionConf";


export class ACharacterAction<A extends iACharacter = iACharacter> extends TCAction {
    constructor(protected _props) {
        super(_props)
        Object.assign(this, ACABattleAttackee);
        Object.assign(this, ACABattleAttacker);
    }


    public convertMainToSubAction(actor: iACharacter, actMain: eAbsAction) {
        const sub = ACABattleAttackerMain(actor, actMain);
        if (sub) return sub;
    }


    /*
    *
    * interaction action
    *
    * */

    public [eActInteract.trigger](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    }

    public [eActInteract.loot](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    }

    public [eActCore.crouch](actor: iACharacter): eBtTickStatus {
        return eBtTickStatus.SUCCESS;
    }

    public [eActCore.sprint](actor: iACharacter): eBtTickStatus {
        return eBtTickStatus.SUCCESS;
    }
}