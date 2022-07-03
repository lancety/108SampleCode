import {TCAction} from "../TCAction";
import {iABody} from "../../../_class/actorClass/ABody.type";
import {iAPawn} from "../../../_class/actorClass/APawn.type";
import {objectGroupIs} from "../../../../moduleObjectGroup/objectGroup.util";
import {epObjectGroupPathIndex} from "../../../../moduleObjectGroup/objectPath.type";
import {eBtTickStatus} from "../../../../../script_module/behaviorEditor/src/behaviorTree/bt.enum";
import {eObjectRole} from "../../../../moduleObject/object.role";
import {ObjectAttr} from "../../../../moduleObject/objectAttr";
import {epABodyAttrs} from "../../../_class/actorClass/ABody.attr.enum";
import {aiScope} from "../../../../globalWorker/ai/aiScope";
import {iACActionHandleOutput} from "../TCAction.type";
import {epABodyStatus, epABodyStatusIndex} from "../../../_class/actorClass/ABody.enum";
import {Actors108} from "../../../_class/_actors/actors";
import {baseScope} from "../../../../global/baseScope";
import {eEngineMode} from "../../../../global/baseScope.enum";
import {rcaRemoveClientUtil} from "../../../../globalShare/rcaRemove/rcaRemoveClientUtil";
import {epObjectKey} from "../../../../moduleObjectGroup/objectKey.type";
import {eObjectGroup} from "../../../../moduleObjectGroup/objectGroup.enum";
import {asServer} from "../../../../globalWorker/ai/asServer";
import {iItemInstance} from "../../../../moduleItem/item.type";
import {itemInstanceUtil} from "../../../../moduleItem/itemInstance.util";
import {AAItemLoot} from "../../../_class/actorGroup/actor/AAItemLoot";
import {eActBattle, eActCore, eAiAction} from "../../../../moduleAction/action.enum";
import {epPhysicsLoc} from "../../../../modulePhysics/props/physicsLoc.type";
import {AActorUtil} from "../../../_class/actorClass/AActor.util";
import {epPhysicsOpt} from "../../../../modulePhysics/opts/physicsOpt.enum";
import {aiActions} from "../../../../moduleAction/aiActionConf";

export const ACABattleAttackeeUtil = {
    beaten(action: TCAction, attackee: iABody, attacker: iAPawn): iACActionHandleOutput {
        /*
        * validation
        * */
        if (attackee.attrs[epABodyAttrs.status].value === epABodyStatusIndex[epABodyStatus.destroyed]) {
            return eBtTickStatus.FAILURE;
        }
        if (objectGroupIs.collideToolHittable(attackee.path[epObjectGroupPathIndex.gp]) === false) {
            return eBtTickStatus.FAILURE;
        }

        /*
        * animBeaten - attackee
        * */
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.animDuration], aiActions[eActBattle.beaten].animDuration.slice());
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.actCooldown], aiActions[eActBattle.beaten].actCooldown);
        action.actLogger.active && action.actLogger.log("beaten tickId", aiScope.runner.tickId);

        /*
        * doBeaten - attackee
        * */
        if (attackee.opts.role === eObjectRole.authority) {
            const damage = ACABattleAttackeeUtil.calcDamage(attackee, attacker, 15);
            ObjectAttr.setVal(attackee.attrs[epABodyAttrs.hp], attackee.attrs[epABodyAttrs.hp].value - damage);
            ACABattleAttackeeUtil.registerAttacker(attackee, attacker, damage);
        }

        /*
        * doBeatenLoot - attackee
        * */
        if (attackee.opts.role === eObjectRole.authority && Math.random() > 0.7) {
            const lootItemInstance = [];
            switch(attackee[epObjectKey.gp]) {
                case eObjectGroup.treeConst:
                case eObjectGroup.treeVar:
                    lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 10001,
                        stackCount: 1,
                    } as iItemInstance));
                    break;
                case eObjectGroup.mineralConst:
                case eObjectGroup.mineralVar:
                    if (Math.random() < 0.9) {
                        lootItemInstance.push(itemInstanceUtil.safeCreate({
                            id: asServer.itemInstanceIdAnchor++,
                            tempId: 20001,
                            stackCount: 1,
                        } as iItemInstance));
                    } else {
                        lootItemInstance.push(itemInstanceUtil.safeCreate({
                            id: asServer.itemInstanceIdAnchor++,
                            tempId: 20002,
                            stackCount: 1,
                        } as iItemInstance));
                    }
                    break;
                case eObjectGroup.lowIqVar:
                case eObjectGroup.midIqVar:
                case eObjectGroup.highIqVar:
                    Math.random() > 0.95 && lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 30001,
                        stackCount: 1,
                    } as iItemInstance));
                    Math.random() > 0.95 && lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 31001,
                        stackCount: 1,
                    } as iItemInstance));
                    break;
            }
            lootItemInstance.forEach(item => {
                const loot = AAItemLoot.createAdd(
                    attackee.attrs[epPhysicsLoc.pr].value,
                    attackee.attrs[epPhysicsLoc.pz].value,
                    AActorUtil.posAround(attackee, attackee.opts[epPhysicsOpt.shape][0] + 1),
                    item
                );
            })
        }

        /*
        * doBeatenBuff - attackee
        * */

        /*
        * doBeatenDebuff - attackee
        * */



        /*
        * doBeat - attacker
        * */

        /*
        * doBeatBuff - attacker
        * */

        /*
        * doBeatDebuff - attacker
        * */

        if(attackee.attrs[epABodyAttrs.hp].value > 0) {
            return eBtTickStatus.SUCCESS;
        } else if (attackee.opts.role === eObjectRole.authority) {
            return ACABattleAttackeeUtil.destroyed(action, attackee);
        }
    },
    destroyed(action: TCAction, attackee: iABody): iACActionHandleOutput {
        /*
        * animDestroyed - attackee
        * */
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.animDuration], aiActions[eActCore.destroyed].animDuration.slice());
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.actCooldown], aiActions[eActCore.destroyed].actCooldown);
        action.actLogger.active && action.actLogger.log("destroyed tickId", aiScope.runner.tickId);

        /*
        * doDestroy - attackee
        * */
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.status], epABodyStatusIndex[epABodyStatus.destroyed]);
        ObjectAttr.setVal(attackee.attrs[epABodyAttrs.statusTimestamp], Date.now());

        /*
        * doDestroyedLoot - attackee
        * */
        if (attackee.opts.role === eObjectRole.authority) {
            const lootItemInstance = [];
            switch(attackee[epObjectKey.gp]) {
                case eObjectGroup.treeConst:
                case eObjectGroup.treeVar:
                    lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 10001,
                        stackCount: 3 + Math.floor(Math.random() * 3),
                    } as iItemInstance));
                    lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 10002,
                        stackCount: 3 + Math.floor(Math.random() * 3),
                    } as iItemInstance));
                    break;
                case eObjectGroup.mineralConst:
                case eObjectGroup.mineralVar:
                    lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 20001,
                        stackCount: 3 + Math.floor(Math.random() * 3),
                    } as iItemInstance));
                    lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 20002,
                        stackCount: 2 + Math.floor(Math.random() * 2),
                    } as iItemInstance));
                    break;
                case eObjectGroup.lowIqVar:
                case eObjectGroup.midIqVar:
                case eObjectGroup.highIqVar:
                    Math.random() > 0.8 && lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 30002,
                        stackCount: 1,
                    } as iItemInstance));
                    Math.random() > 0.8 && lootItemInstance.push(itemInstanceUtil.safeCreate({
                        id: asServer.itemInstanceIdAnchor++,
                        tempId: 31002,
                        stackCount: 1,
                    } as iItemInstance));
                    break;
            }

            lootItemInstance.forEach(item => {
                const loot = AAItemLoot.createAdd(
                    attackee.attrs[epPhysicsLoc.pr].value,
                    attackee.attrs[epPhysicsLoc.pz].value,
                    AActorUtil.posAround(attackee, attackee.opts[epPhysicsOpt.shape][0] + 1),
                    item
                );
            })
        }

        /*
        * doDestroyedBuff - attackee
        * */

        /*
        * doDestroyedDebuff - attackee
        * */




        /*
        * doDestroy - attacker
        * */

        /*
        * doDestroyBuff - attacker
        * */

        /*
        * doDestroyDebuff - attacker
        * */

        if (attackee.opts.role === eObjectRole.authority) {
            attackee.opts.removeDelay > -1 && setTimeout(()=> {
                Actors108.removeDestroyed_rca(attackee);
                // for serverBrowser ai observer, update rcaRemovedAnchorIndex per attackee
                // notes:  clientGeckos batch anchor index from snapshot; render sync anchor index from renderInfo;
                baseScope.engineMode === eEngineMode.serverBrowser && rcaRemoveClientUtil.rcaRemovedAnchorIndexAdd(attackee);
            }, attackee.opts.removeDelay)
        }

        return [eAiAction.destroyed];
    },

    /**
     * ea - edit attr
     * @param attackee
     * @param attacker
     * @param baseDamage    reference from fn caller, or get it from attacker if not defined
     * @public
     */
    calcDamage(attackee: iABody, attacker: iAPawn, baseDamage?: number) {
        // todo - calculated between attacker <-> actor   (int)
        return 15;
    },



    registerAttacker(actor: iABody, attacker: iAPawn, damage: number) {
        const attackerCache = actor.state.attackerList.queryL2S(item => item.val.attacker === attacker);
        if (attackerCache === undefined) {
            actor.state.attackerList.insertS2L({
                attacker: attacker,
                damage: damage,
                timestamp: Date.now(),
            })
        } else {
            attackerCache.val.damage += damage;
            attackerCache.val.timestamp = Date.now();
        }
    }
}