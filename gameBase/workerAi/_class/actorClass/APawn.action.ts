import {eAbsAction} from "../../../moduleAction/action.enum";
import {TCAction} from "../../_component/tickComponent/TCAction";
import {ACABattleAttackee} from "../../_component/tickComponent/TCAction/ACABattleAttackee";
import {ACABattleAttacker, ACABattleAttackerMain} from "../../_component/tickComponent/TCAction/ACABattleAttacker";
import {iABody} from "./ABody.type";
import {iACharacter} from "./ACharacter.type";

export class APawnAction<A extends iABody = iABody> extends TCAction {
    constructor(protected _props) {
        super(_props);
        Object.assign(this, ACABattleAttackee);
        Object.assign(this, ACABattleAttacker);
    }

    public convertMainToSubAction(actor: iACharacter, actMain: eAbsAction) {
        const sub = ACABattleAttackerMain(actor, actMain);
        if (sub) return sub;
    }
}