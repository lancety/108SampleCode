import {graphUtil} from "../../../../script_base/graph/graph.util";
import {graphVec2} from "../../../../script_base/graph/vec2";
import {aiScope} from "../../../globalWorker/ai/aiScope";
import {iActorRenderInfo} from "../../../moduleActor/ARenderInfo.type";
import {eObjectRole} from "../../../moduleObject/object.role";
import {ObjectAttr,} from "../../../moduleObject/objectAttr";
import {iObjectAttrReplicate} from "../../../moduleObject/objectAttr.type";
import {epPhysicsOpt} from "../../../modulePhysics/opts/physicsOpt.enum";
import {epPhysicsBase,} from "../../../modulePhysics/props/physicsBase.enum";
import {iAActor, iAActorOpts} from "./AActor.type";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {iObjMap} from "../../../../script_base/util/object.type";
import {objectAttrTypedUtil} from "../../../moduleObject/objectAttrTyped.util";
import {AThing} from "./AThing";
import {iComponentProps} from "../../_component/Component.type";
import {epComponent} from "../../_component/Component.enum";
import {PhysicsComponent} from "../../_component/physicsComponent/PhysicsComponent";
import {iACActionProps} from "../../_component/tickComponent/TCAction.type";
import {SpineComponent} from "../../_component/spineComponent/SpineComponent";
import {eActorTag} from "./_actorTag.enum";
import {PI} from "../../../../script_base/util/pi";


/**
 * AActor is used for any game object has basic 2d position, physics, visible or invisible.
 * AActor and children class are used as singleton util class, for all their actors objects.
 *
 * AActor extends parent 'opts' and 'attrs', also manages 'state', 'components', and handle 'tick'
 */
export class AActor<A extends iAActor = iAActor, O extends iAActorOpts = iAActorOpts> extends AThing {

    constructor() {
        super();
    }


    /*
    *
    * initiation
    *
    * */

    protected _initOpts(actor: A, opts: iAActorOpts) {
        super._initOpts(actor);

        actor.opts.abGroup = eActorBaseGroup.actor;
        actor.opts.removeDelay = 1000;
        actor.opts.tags.delete(eActorTag.dataActor);    // actor by default is not pure data because its physics feature

        Object.assign(actor.opts, opts);
    }

    public initAttrs(actor: A, opts: iAActorOpts, attrs: iObjMap<unknown>) {
        super.initAttrs(actor, opts, attrs);

    }

    protected _initState(actor: A) {
        super._initState(actor);

        const {state} = actor as iAActor;

        state.bindChildGPs = [];

        state.animTrackAction = [0, 0, 0, 0];
        state.animTrackEnd = [0, 0, 0, 0];
        state.animTrackLock = [false, false, false, false];
        state.actCoolDownEnd = new Map();
        state.actEventQueue = new Map();
    }

    /*
    *
    * events
    *
    * */

    /**
     * logics when create this actor instance
     * @param {A} actor
     */
    public onAdd(actor: A) {

    }

    /**
     * logics when destroy this actor instance
     * @param {A} actor
     * @protected
     */
    public onRemove(actor: A) {
        // remove my ref from other actors
        actor.colliding.forEach((collideActor) => {
            collideActor.colliding?.delete(actor);
        })

        // remove other actors ref from myself
        actor.colliding?.clear();
    }

    protected _componentsInit() {
        super._componentsInit();
        this.componentReg<iComponentProps>(epComponent.physics, PhysicsComponent, {
            parentObjClass: this,
        })
        this.componentReg<iACActionProps>(epComponent.action, this._componentAction, {
            parentObjClass: this,
        });
        this.componentReg<iComponentProps>(epComponent.spine, SpineComponent, {
            parentObjClass: this,
        })
    }


    public exportRenderInfo(actor: A, force = false): iActorRenderInfo {
        // todo - opt setting
        // render side replication
        if (actor.opts.role === eObjectRole.simulated) {
            [epPhysicsBase.px, epPhysicsBase.py, epPhysicsBase.angle].forEach(attrName => {
                const attr = actor.attrs[attrName];
                const repLast = attr.replicates?.largest?.val as iObjectAttrReplicate<number>,
                    repNext = attr.replicateNext as iObjectAttrReplicate<number>;
                if (repLast && repNext && repLast.serverTime === repNext.serverTime) return;
                if (isNaN(repLast?.valRep) || isNaN(repNext?.valRep)) return;

                const percentage = graphUtil.clamp((
                    Date.now() - repLast.localTime) / (repNext.localTime - repLast.localTime), 0, 1
                );

                if (attrName === epPhysicsBase.angle) {
                    const diff = graphVec2.radianDiff(repLast.valRep, repNext.valRep) * percentage + repLast.valRep;
                    ObjectAttr.setVal(attr, diff < 0 ? PI.PI360 + diff : diff > PI.PI360 ? diff % PI.PI360 : diff);
                } else {
                    const val = (repNext.valRep - repLast.valRep) * percentage + repLast.valRep;
                    ObjectAttr.setVal(attr, val);
                }
            })

        }

        const attrTypedBuffer = objectAttrTypedUtil.typedBufferTemplate(actor.path);
        const attrTyped = objectAttrTypedUtil.attr2TypedBuffer(actor, (attr) => {
            return force || (attr.opts.bRender && attr.tickId === aiScope.runner.tickId);
        }, attrTypedBuffer) || attrTypedBuffer;
        const info: iActorRenderInfo = {
            path: actor.path,
            attrsTyped: attrTyped,
        }

        if (force) {
            info.physicsOpts = {
                [epPhysicsOpt.gs]: actor.opts[epPhysicsOpt.gs],
                [epPhysicsOpt.shape]: actor.opts[epPhysicsOpt.shape],
                [epPhysicsOpt.size]: actor.opts[epPhysicsOpt.size],
            };
            info.bindChildPaths = actor.bindChildActors ? actor.bindChildActors.flatMap(child => child.path) : [0];
        }

        return info;
    }
}