import {iACABattleAttacker} from "./ACABattle.type";
import {iABody} from "../../../_class/actorClass/ABody.type";
import {epABodyAttrs} from "../../../_class/actorClass/ABody.attr.enum";
import {graphVec2} from "../../../../../script_base/graph/vec2";
import {epPhysicsBase} from "../../../../modulePhysics/props/physicsBase.enum";

export const ACABattleAttackerUtil = {
    // todo - attacker distance and lastAttackTime checking value setting in the APawn combat
    // distance - for ACharacter or APawn which can follow attacker, the distance setting is different to fixed pawn which use attack range as distance
    isAttackerActive(actor: iABody, battleAttacker: iACABattleAttacker | undefined): boolean {
        if (battleAttacker === undefined) return;

        const {attacker, timestamp} = battleAttacker;
        if (attacker === undefined) return false;
        if (attacker.attrs[epABodyAttrs.hp].value <= 0) return false;

        const distance = graphVec2.distance([
            actor.attrs[epPhysicsBase.px].value, actor.attrs[epPhysicsBase.py].value
        ], [
            attacker.attrs[epPhysicsBase.px].value, attacker.attrs[epPhysicsBase.py].value
        ]);

        // todo - battleInactiveDuration, max distance can be vary and configurable
        return Date.now() - timestamp < 30000 && distance < 60;
    },
}