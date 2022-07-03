import {serverNetConfig} from "../../../gameConfig/networking/serverNetConfig";
import {btRunnerIndex} from "../../../moduleBT/btRunnerIndex";
import {eObjectRole} from "../../../moduleObject/object.role";
import {eObjAttrRepMode} from "../../../moduleObject/objectAttr.enum";
import {eSchemaType} from "../../../moduleSchema/schema.enum";
import {TCBehaviorTree} from "../../_component/tickComponent/TCBehaviorTree";
import {iCBehaviorProps} from "../../_component/tickComponent/TCBehaviorTree.type";
import {epTickComponent} from "../../_component/tickComponent/TickComponent.enum";
import {ABody} from "./ABody";
import {APawnAction} from "./APawn.action";
import {APawnAttrsConfMap, epAPawnAttrs} from "./APawn.attr.enum";
import {iAPawn, iAPawnOpts} from "./APawn.type";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {iObjMap} from "../../../../script_base/util/object.type";
import {objectAttrUtil} from "../../../moduleObject/objectAttr.util";
import {numberUtil} from "../../../../script_base/util/number";


export class APawn<A extends iAPawn = iAPawn, O extends iAPawnOpts = iAPawnOpts> extends ABody {
    protected _componentAction: unknown = APawnAction;

    protected _initOpts(actor: A, opts: O) {
        super._initOpts(actor, opts);

        actor.opts.abGroup = eActorBaseGroup.pawn;
    }

    protected _initState(actor: A) {
        super._initState(actor);

        actor.state.tickBtAwaitCount = 0;

        if (actor.opts.role === eObjectRole.authority) {
            actor.state.cachedPlayerAct = new Set();
            actor.state.cachedAiAct = new Set();
        }
    }

    public initAttrs(actor: A, opts: O, attrs: iObjMap<unknown>) {
        super.initAttrs(actor, opts, attrs);


        actor.attrs[epAPawnAttrs.epMax] = objectAttrUtil.attrInit(APawnAttrsConfMap[epAPawnAttrs.epMax], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
        }, actor, attrs[epAPawnAttrs.epMax], 100);

        actor.attrs[epAPawnAttrs.ep] = objectAttrUtil.attrInit(APawnAttrsConfMap[epAPawnAttrs.ep], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
            max: actor.attrs[epAPawnAttrs.epMax].value,
        }, actor, attrs[epAPawnAttrs.ep], actor.attrs[epAPawnAttrs.epMax].value);

        actor.attrs[epAPawnAttrs.lifeMax] = objectAttrUtil.attrInit(APawnAttrsConfMap[epAPawnAttrs.lifeMax], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
        }, actor, attrs[epAPawnAttrs.lifeMax], 100);

        actor.attrs[epAPawnAttrs.life] = objectAttrUtil.attrInit(APawnAttrsConfMap[epAPawnAttrs.life], {
            bufferType: eSchemaType.uint16,
            bReplicateMode: eObjAttrRepMode.tcp,
            bRender: true,
            min: 0,
            max: actor.attrs[epAPawnAttrs.lifeMax].value,
        }, actor, attrs[epAPawnAttrs.life], actor.attrs[epAPawnAttrs.lifeMax].value);

    }


    protected _componentsInit() {
        super._componentsInit();
        this.componentReg<iCBehaviorProps>(epTickComponent.behavior, TCBehaviorTree, {
            parentObjClass: this,
            tickFrame: Math.floor(60 / serverNetConfig.fps),
            btTree: btRunnerIndex[this.gp],
            gp: this.gp,
        })
    }

    /**
     * allow ai logic run, physics body exist
     * @param {A} actor
     * @protected
     */
    protected _tickOn(actor: A) {
        actor.state.tickBt = true;
    }

    /**
     * block ai logic run, physics body exist
     * @param {A} actor
     * @protected
     */
    protected _tickOff(actor: A) {
        actor.state.tickBt = false;
    }
}