import {eActBattle, eActCore} from "../../../../moduleAction/action.enum";
import {iABody} from "../../../_class/actorClass/ABody.type";
import {iAPawn} from "../../../_class/actorClass/APawn.type";
import {ACABattleAttackeeUtil} from "./ACABattleAttackee.util";
import {iACActionHandleOutput} from "../TCAction.type";


export const ACABattleAttackee = {
    [eActBattle.beaten](attackee: iABody, attacker: iAPawn): iACActionHandleOutput {
        return ACABattleAttackeeUtil.beaten(this, attackee, attacker);
    },

    [eActBattle.beatenBack](attackee: iABody, attacker: iAPawn): iACActionHandleOutput {
        return ACABattleAttackeeUtil.beaten(this, attackee, attacker);
    },
    [eActCore.destroyed](attackee: iABody) {
        return ACABattleAttackeeUtil.destroyed(this, attackee);
    }
}