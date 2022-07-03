import {graphVec2} from "../../../../../script_base/graph/vec2";
import {eBtTickStatus} from "../../../../../script_module/behaviorEditor/src/behaviorTree/bt.enum";
import {aiScope} from "../../../../globalWorker/ai/aiScope";
import {eAbsAction, eAiAction} from "../../../../moduleAction/action.enum";
import {eActBattle} from "../../../../moduleAction/action.enum";
import {eAiActionTrigger} from "../../../../moduleAction/aiActionConf.enum";
import {ObjectAttr} from "../../../../moduleObject/objectAttr";
import {epObjectKey} from "../../../../moduleObjectGroup/objectKey.type";
import {eObjectGroup} from "../../../../moduleObjectGroup/objectGroup.enum";
import {epPhysicsBase} from "../../../../modulePhysics/props/physicsBase.enum";
import {epABodyAttrs} from "../../../_class/actorClass/ABody.attr.enum";
import {iACharacter} from "../../../_class/actorClass/ACharacter.type";
import {TCAction} from "../TCAction";
import {aiActions} from "../../../../moduleAction/aiActionConf";


export function ACABattleAttackerMain(actor: iACharacter, actMain: eAbsAction): eAiAction {
    // switch main action to sub action
    switch (actMain) {
        case eAbsAction.actA:
            return eActBattle.attack;
    }
}

export const ACABattleAttacker = {
    /*
    *
    * move action
    *
    * */
    [eActBattle.dodge](actor: iACharacter): eBtTickStatus {
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.animDuration], aiActions[eActBattle.dodge].animDuration.slice());
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.actCooldown], aiActions[eActBattle.dodge].actCooldown);
        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.dodgeBack](actor: iACharacter): eBtTickStatus {
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.animDuration], aiActions[eActBattle.dodgeBack].animDuration.slice());
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.actCooldown], aiActions[eActBattle.dodgeBack].actCooldown);
        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attack](actor: iACharacter): eBtTickStatus {
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.animDuration], aiActions[eActBattle.attack].animDuration.slice());
        ObjectAttr.setVal(actor.attrs[epABodyAttrs.actCooldown], aiActions[eActBattle.attack].actCooldown);
        return eBtTickStatus.SUCCESS;
    },

    /*battle*/
    [eActBattle.hit](actor: iACharacter): eBtTickStatus {
        const hitSensor = actor.bindChildActors?.find(child => child[epObjectKey.gp] === eObjectGroup.toolHitSensor);

        if (hitSensor === undefined) return eBtTickStatus.FAILURE;

        hitSensor?.colliding?.forEach(pawn => {
            const act = Math.abs(graphVec2.radianDiff(pawn.attrs[epPhysicsBase.angle].value, actor.attrs[epPhysicsBase.angle].value)) > Math.PI / 2 ? eActBattle.beaten : eActBattle.beatenBack;
            (this as TCAction).handleAiAction(pawn, act, eAiActionTrigger.local, actor);
        })

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attS](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attDb](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attRange](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attGunS](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.attGunDb](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },


    [eActBattle.aim](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.aimS](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.aimDb](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.aimRange](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.aimGunS](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },

    [eActBattle.aimGunDb](actor: iACharacter): eBtTickStatus {

        return eBtTickStatus.SUCCESS;
    },
}