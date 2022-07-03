import {iAPawn} from "../../../_class/actorClass/APawn.type";

export interface iACABattleAttacker {
    attacker: iAPawn,
    damage: number,     // used for sorting
    timestamp: number, // last attack timestamp
}