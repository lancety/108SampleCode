import {eObjAttrRepMode} from "../../../moduleObject/objectAttr.enum";
import {eSchemaType} from "../../../moduleSchema/schema.enum";
import {AActor} from "./AActor";
import {ABodyAction} from "./ABody.action";
import {ABodyAttrsConfMap, epABodyAttrs} from "./ABody.attr.enum";
import {iABody, iABodyOpts} from "./ABody.type";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {epABodyStatus, epABodyStatusIndex} from "./ABody.enum";
import {iObjectAttr} from "../../../moduleObject/objectAttr.type";
import {epTickComponent} from "../../_component/tickComponent/TickComponent.enum";
import {eAiActionTrigger} from "../../../moduleAction/aiActionConf.enum";
import {awcgRepLog} from "../../../globalWorker/ai/aiDebug";
import {iObjMap} from "../../../../script_base/util/object.type";
import {eObjectRole} from "../../../moduleObject/object.role";
import {LinkedListDouble} from "../../../../script_base/util/linkedListDouble";
import {iACABattleAttacker} from "../../_component/tickComponent/TCAction/ACABattle.type";
import {objectAttrUtil} from "../../../moduleObject/objectAttr.util";
import {eActCore, eAiAction} from "../../../moduleAction/action.enum";
import {aiActions} from "../../../moduleAction/aiActionConf";

export class ABody<A extends iABody = iABody, O extends iABodyOpts = iABodyOpts> extends AActor {
    protected _componentAction: unknown = ABodyAction;

    protected _initOpts(actor: A, opts: O) {
        super._initOpts(actor, opts);

        actor.opts.abGroup = eActorBaseGroup.body;
    }

    protected _initState(actor: A) {
        super._initState(actor);

        if (actor.opts.role === eObjectRole.authority) {
            actor.state.attackerList = new LinkedListDouble<iACABattleAttacker>((a, b) => a.damage - b.damage);
        }
    }

    public initAttrs(actor: A, opts: O, attrs: iObjMap<unknown>) {
        super.initAttrs(actor, opts, attrs);

        actor.attrs[epABodyAttrs.hpMax] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.hpMax], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
        }, actor, attrs[epABodyAttrs.hpMax], 100);

        actor.attrs[epABodyAttrs.hp] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.hp], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
            max: actor.attrs[epABodyAttrs.hpMax].value,
        }, actor, attrs[epABodyAttrs.hp], actor.attrs[epABodyAttrs.hpMax].value);

        actor.attrs[epABodyAttrs.toolHittable] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.toolHittable], {
            bufferType: eSchemaType.uint8,
            bRender: true,
        }, actor, attrs[epABodyAttrs.toolHittable], false);

        actor.attrs[epABodyAttrs.status] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.status], {
            bufferType: eSchemaType.uint8,
            bRender: true,
            bReplicateMode: eObjAttrRepMode.tcp,
        }, actor, attrs[epABodyAttrs.status], epABodyStatusIndex[epABodyStatus.idle]);

        actor.attrs[epABodyAttrs.statusTimestamp] = objectAttrUtil.attrInit(ABodyAttrsConfMap.statusTimestamp, {
            bufferType: eSchemaType.float32,
            bRender: true,
            bReplicateMode: eObjAttrRepMode.tcp,
        }, actor, attrs[epABodyAttrs.statusTimestamp], Date.now())

        if (actor.attrs[epABodyAttrs.status].value === epABodyStatusIndex[epABodyStatus.destroyed]) {
            attrs[epABodyAttrs.anim] = aiActions[eActCore.destroyed].animIndex.map(animIndex => animIndex >=0 ? animIndex : 0);
        }
        actor.attrs[epABodyAttrs.anim] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.anim], {
            bufferType: eSchemaType.int16,  // can be positive: set anim, or negative: unset anim
            bRender: true,
            bCache: true,
        }, actor, attrs[epABodyAttrs.anim]);


        actor.attrs[epABodyAttrs.animTickId] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.animTickId], {
            bufferType: eSchemaType.float32,
            bRender: true,
        }, actor, attrs[epABodyAttrs.animTickId]);

        actor.attrs[epABodyAttrs.animDuration] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.animDuration], {
            bufferType: eSchemaType.float32,
            bRender: true,
            bCache: true,
        }, actor, attrs[epABodyAttrs.animDuration]);
        actor.attrs[epABodyAttrs.actCooldown] = objectAttrUtil.attrInit(ABodyAttrsConfMap[epABodyAttrs.actCooldown], {
            bufferType: eSchemaType.float32,
            bRender: true,
            bCache: true,
        }, actor, attrs[epABodyAttrs.actCooldown]);
    }

    protected _attrRepWatchInit() {
        super._attrRepWatchInit();
        this._attrRepHandlerWatch(epABodyAttrs.status, (actor: A, attr: iObjectAttr, repVal) => {
            if (repVal === attr.value) {
                awcgRepLog.log('status rep ignore', actor.path, attr.value, repVal);
                return;
            }
            if (repVal === epABodyStatusIndex[epABodyStatus.destroyed]) {
                awcgRepLog.log('status rep action', actor.path);
                this.componentGet<ABodyAction>(epTickComponent.action).handleAiAction(
                    actor, eAiAction.destroyed, eAiActionTrigger.local
                )
            }
        })
    }
}