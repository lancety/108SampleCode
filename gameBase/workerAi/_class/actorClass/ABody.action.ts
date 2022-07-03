import {eAbsAction, eAiAction} from "../../../moduleAction/action.enum";
import {TCAction} from "../../_component/tickComponent/TCAction";
import {ACABattleAttackee} from "../../_component/tickComponent/TCAction/ACABattleAttackee";
import {iABody} from "./ABody.type";
import {iACharacter} from "./ACharacter.type";


export class ABodyAction<A extends iABody = iABody> extends TCAction {
    constructor(protected _props) {
        super(_props);
        Object.assign(this, ACABattleAttackee);
    }

    public convertMainToSubAction(actor: iACharacter, actMain: eAbsAction): eAiAction {
        return;
    }
}