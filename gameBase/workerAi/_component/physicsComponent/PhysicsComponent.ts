import {Component} from "../Component";
import {objectAttrUtil} from "../../../moduleObject/objectAttr.util";
import {eSchemaType} from "../../../moduleSchema/schema.enum";
import {eObjAttrRepMode} from "../../../moduleObject/objectAttr.enum";
import {epPhysicsComponentAttrs, PhysicsComponentAttrsConfMap} from "./PhysicsComponent.attrs.enum";
import {iPhysicsOpts} from "../../../modulePhysics/opts/physicsOpt.type";
import {
    epPhysicsLoc, epPhysicsLocIndex,
    epPhysicsLocOrderedKey,
    iPhysicsLocArr,
    iPhysicsLocArrBuffer
} from "../../../modulePhysics/props/physicsLoc.type";
import {epPhysicsOpt} from "../../../modulePhysics/opts/physicsOpt.enum";
import {iComponentProps} from "../Component.type";
import {ObjectBase} from "../../../moduleObject/object";
import {iObjectKey} from "../../../moduleObjectGroup/objectKey.type";
import {iAActor, iAActorOpts} from "../../_class/actorClass/AActor.type";
import {iObjMap} from "../../../../script_base/util/object.type";
import {creationConfig} from "../../../gameConfig/creations/creationConfig";
import {epCreationConfig} from "../../../gameConfig/creations/creationConfig.type";
import {eCreationCategoryIndexKey} from "../../../../script_share/@type/creationProfile";
import {physicsOptUtil} from "../../../modulePhysics/opts/physicsOpt.util";
import {physicsActionUtil} from "../../../modulePhysics/physicsActions.util";
import {ePhysicsAction} from "../../../modulePhysics/physicsActions.type";
import {aPhysicsLogger} from "../../_class/_actors/actor_logger";
import {iPhysicsStateBaseArr, iPhysicsStateBaseArrBuffer} from "../../../modulePhysics/props/physicsBase.type";
import {
    epPhysicsBase,
    epPhysicsBaseIndex,
    epPhysicsBaseOrderedKey
} from "../../../modulePhysics/props/physicsBase.enum";
import {iObjectAttr} from "../../../moduleObject/objectAttr.type";
import {ObjectAttr} from "../../../moduleObject/objectAttr";


export class PhysicsComponent<A extends iAActor = iAActor> extends Component {

    constructor(protected _props: iComponentProps) {
        super(_props);
        this._updateCreate(_props.parentObjClass);
    }

    /*
    *
    * Actor.create extension
    *
    * */

    protected _updateCreate(ObjClass: ObjectBase) {
        const originalFn = ObjClass.create.bind(ObjClass);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const component = this;
        ObjClass.create = function(keys: iObjectKey, opts: iAActorOpts, attrs: iObjMap<unknown>): iAActor {
            const actor = originalFn(keys, opts, attrs) as iAActor;
            component._initPhysics(actor, opts, attrs);
            return actor;
        };
    }

    protected _initPhysics(actor: iAActor, physicsOpts: iPhysicsOpts, attrs: iObjMap<unknown>) {
        this._initPhysicsOpts(actor, physicsOpts);

        actor.collideStart = new Set();
        actor.collideEnd = new Set();
        actor.colliding = new Set();
    }

    /*
    *
    * init opt, attr, state
    *
    * */

    protected _initPhysicsOpts(actor: iAActor, physicsOpts?: iPhysicsOpts) {
        const {pos} = actor.opts;
        const {creationCat, creationId} = actor.attrs;
        if (creationCat?.value >= 0 && creationId?.value >= 0) {
            const creation = creationConfig[epCreationConfig.collections][eCreationCategoryIndexKey[creationCat.value]][creationId.value];
            const {gs, size, shape} = physicsOpts;
            if (gs === undefined || size === undefined || shape === undefined) {
                // new actors from creation data
                const generatedOpts = physicsOptUtil.optFromCreature(creation, pos);
                Object.assign(actor.opts, generatedOpts);
            }
        }

        if (
            !actor.opts[epPhysicsOpt.shape] ||
            (!actor.opts[epPhysicsOpt.size] && !actor.opts[epPhysicsOpt.vertices])
        ) {
            console.error('actor opt incomplete', physicsOpts);
        }
    }

    protected _updateInitAttrs(ObjClass) {
        const originalFn = ObjClass.initAttrs;
        ObjClass.initAttrs = function(actor, opts, attrs) {
            originalFn(actor, opts, attrs);
            opts = opts || {} as iPhysicsOpts;

            actor.attrs[epPhysicsComponentAttrs.pr] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.pr], {
                bufferType: eSchemaType.uint16,
                bReplicateMode: eObjAttrRepMode.tcp,   // client side need this to calculate where the closest region are
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.pr], opts[epPhysicsLoc.pr]);

            actor.attrs[epPhysicsComponentAttrs.pz] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.pz], {
                bufferType: eSchemaType.uint16,
                // bReplicateMode: eObjAttrRepMode.tcp,    // todo - make decision - should physics sync pz?
                // bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.pz], opts[epPhysicsLoc.pz]);

            actor.attrs[epPhysicsComponentAttrs.pf] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.pf], {
                bufferType: eSchemaType.uint32,
                // bReplicateMode: eObjAttrRepMode.tcp,    // todo - make decision - should physics sync pf?
                // bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.pf], opts[epPhysicsLoc.pf]);

            actor.attrs[epPhysicsComponentAttrs.pa] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.pa], {
                bufferType: eSchemaType.uint32,
                // bReplicateMode: eObjAttrRepMode.tcp,    // todo - make decision - should physics sync pa?
                // bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.pa], opts[epPhysicsLoc.pa]);


            actor.attrs[epPhysicsComponentAttrs.px] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.px], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bInterpolate: true,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.px], opts[epPhysicsOpt.pos][0] || 0);

            actor.attrs[epPhysicsComponentAttrs.py] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.py], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bInterpolate: true,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.py], opts[epPhysicsOpt.pos][1] || 0);

            actor.attrs[epPhysicsComponentAttrs.angle] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.angle], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bInterpolate: true,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.angle], 0);

            actor.attrs[epPhysicsComponentAttrs.vx] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.vx], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.vx], 0);

            actor.attrs[epPhysicsComponentAttrs.vy] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.vy], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.vy], 0);

            actor.attrs[epPhysicsComponentAttrs.speed] = objectAttrUtil.attrInit(PhysicsComponentAttrsConfMap[epPhysicsComponentAttrs.speed], {
                bufferType: eSchemaType.float32,
                bReplicateMode: eObjAttrRepMode.udp,
                bReconciliation: true,
                bRender: true,
            }, actor, attrs[epPhysicsComponentAttrs.speed], 0);

            /*
             *
             * above values are temporarily set, but will be flushed by physics state soon
             * so need to directly update these values to physics by using 'action'
             *
             */
            if (actor.attrs[epPhysicsComponentAttrs.angle].value) {
                physicsActionUtil.push(actor.path, ePhysicsAction.rotate, actor.attrs[epPhysicsComponentAttrs.angle].value);
            }
        }
    }

    /*
    *
    * physics specific API
    *
    * */
    public collideClearCache(actor: A) {
        actor.collideStart.clear();
        actor.collideEnd.clear();
    }

    public collideStartCache(actorSelf: A, actorOther: A) {
        aPhysicsLogger.active && aPhysicsLogger.log('collide start', actorSelf.path.join(","), actorOther.path.join(","));
        actorSelf.collideStart.add(actorOther);
        actorSelf.colliding.add(actorOther);
    }

    public collideEndCache(actorSelf: A, actorOther: A) {
        aPhysicsLogger.active && aPhysicsLogger.log('collide end', actorSelf.path.join(","), actorOther.path.join(","));
        actorSelf.collideEnd.add(actorOther);
        actorSelf.colliding.delete(actorOther);
    }

    protected _collideStartCallbacks = [];
    protected _collideEndCallbacks = [];
    public onCollideStart(actorSelf: A, actorOther: A) {
        this._collideStartCallbacks.forEach(callback => callback(actorSelf, actorOther));
    }

    public onCollideEnd(actorSelf: A, actorOther: A) {
        this._collideEndCallbacks.forEach(callback => callback(actorSelf, actorOther));
    }

    public watchCollideStart(callback: (self: A, other: A)=> void) {
        this._collideStartCallbacks.push(callback);
        return this;
    }

    public watchCollideEnd(callback: (self: A, other: A)=> void) {
        this._collideEndCallbacks.push(callback);
        return this;
    }

    /*
    *
    * data import export
    *
    * */


    /*
    *
    * data import export
    *
    * */
    public importPhysicsBaseArr(actor: A, physicsBaseArr: iPhysicsStateBaseArr | iPhysicsStateBaseArrBuffer) {
        epPhysicsBaseOrderedKey.forEach(key => {
            const attr: iObjectAttr = actor.attrs[key];
            if (attr === undefined) return;
            if (physicsBaseArr[epPhysicsBaseIndex[key]] === undefined) return;
            ObjectAttr.setVal(attr, physicsBaseArr[epPhysicsBaseIndex[key]]);
        })

        // IMPORTANT - update opts if included changed prop in any format
        actor.opts[epPhysicsOpt.pos] = [actor.attrs[epPhysicsBase.px].value, actor.attrs[epPhysicsBase.py].value];

    }


    public importPhysicsLocArr(actor: A, physicsLocArr: iPhysicsLocArr | iPhysicsLocArrBuffer) {
        epPhysicsLocOrderedKey.forEach(attrName => {
            const attr: iObjectAttr = actor.attrs[attrName];
            if (attr === undefined) return;

            const keyIndex = epPhysicsLocIndex[attrName];
            const val = physicsLocArr[keyIndex];
            if (val > 0) {
                // for loc id, it must be greater than 0 always when design
                ObjectAttr.setVal(attr, val);

                // IMPORTANT - update loc opts when it changed to actor
                actor.opts[attr.name] = val;
            }
        })
    }
}