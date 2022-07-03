import {vector2, vector4} from "../../../../script_base/@type/graph";
import {Logger} from "../../../../script_base/util/logger";
import {float, int} from "../../../../script_base/util/number";
import {eAiDebug} from "../../../globalWorker/ai/aiDebug";
import {aiScope} from "../../../globalWorker/ai/aiScope";
import {eObjectRole} from "../../../moduleObject/object.role";
import {epObjectKey, iObjectKey} from "../../../moduleObjectGroup/objectKey.type";
import {dynamicSensorSize, eObjectGroup} from "../../../moduleObjectGroup/objectGroup.enum";
import {objectGroupIs} from "../../../moduleObjectGroup/objectGroup.util";
import {objPathArr} from "../../../moduleObjectGroup/objectPath";
import {epObjectGroupPathIndex, iObjectPathArr} from "../../../moduleObjectGroup/objectPath.type";
import {ePhysicsShape} from "../../../modulePhysics/physics.enum";
import {epPhysicsOpt} from "../../../modulePhysics/opts/physicsOpt.enum";
import {iAActor, iAActorOpts} from "../actorClass/AActor.type";
import {actorGroupClassRef} from "../actorGroup/actorGroupClass.ref";
import {AGM} from "../actorGroup/actorGroupMapActor";
import {iObjMap} from "../../../../script_base/util/object.type";
import {epPhysicsLoc} from "../../../modulePhysics/props/physicsLoc.type";
import {rcaRemoveUtil} from "../../../globalShare/rcaRemove/rcaRemove.util";
import {AActorUtil} from "../actorClass/AActor.util";
import {iAThing, iAThingOpts} from "../actorClass/AThing.type";
import {iPhysicsOpts} from "../../../modulePhysics/opts/physicsOpt.type";
import {AThing} from "../actorClass/AThing";

export class Actors108 {
    static _logger = new Logger(eAiDebug.actors108);
    static _loggerAR = new Logger(eAiDebug.actorAddRemove);
    /**
     * as the name says, only create actor object, without worrying children or add to actor map
     * @param {iObjectKey} keys
     * @param {iAThingOpts} opts
     * @param attrs todo - avoid making new object if it is not provided
     * @returns {iObjectBase}
     */
    static createActor(keys: iObjectKey, opts: iPhysicsOpts, attrs: iObjMap<unknown> = {}) {
        try {
            return actorGroupClassRef<AThing>(keys.gp)?.create(keys, opts, attrs);
        } catch (err) {
            console.error(err);
        }
    }

    static addActor(actor: iAThing): iAThing {
        if (actor === undefined) {
            console.error("adding undefined actor");
            return;
        }
        if (actor.opts.role === eObjectRole.autonomous) {
            AGM.addObj(aiScope.actorAutonomousMap, actor);
        }
        AGM.addObj(aiScope.actorObjMap, actor);
        Actors108._addPhysicsBody(actor as iAActor);
        Actors108._createChildren(actor as iAActor);
        actorGroupClassRef<AThing>(actor[epObjectKey.gp])?.onAdd(actor);

        actor[epObjectKey.gp] !== eObjectGroup.grassDeco && actor[epObjectKey.gp] !== eObjectGroup.treeConst && this._loggerAR.log("++ add", actor.path);

        return actor;
    }

    static createAdd<T extends iAThing = iAThing>(keys: iObjectKey, opts: iPhysicsOpts, attrs?: iObjMap<unknown>): T {
        return Actors108.addActor(Actors108.createActor(keys, opts, attrs)) as T;
    }

    // remove actor related stuff except removing it from aiScope.actorObjMap
    // used by batch remove - removeByPathArr, removeRegionConstActors where matches multi actors
    static _remove(actor?: iAActor) {
        if (actor === undefined) return;

        if (actor.opts.role === eObjectRole.autonomous) {
            AGM.removeObj(aiScope.actorAutonomousMap, actor);
        }

        Actors108._removeChildren(actor);
        Actors108._removePhysicsBody(actor);
        actorGroupClassRef<AThing>(actor[epObjectKey.gp]).onRemove(actor);

        actor[epObjectKey.gp] !== eObjectGroup.grassDeco && actor[epObjectKey.gp] !== eObjectGroup.treeConst && actor[epObjectKey.gp] && this._loggerAR.log("-- remove", actor.path);
    }
    // for remove SINGLE actor
    static remove(actor: iAActor): iAActor {
        AGM.removeObj(aiScope.actorObjMap, actor);
        Actors108._remove(actor);
        return actor;
    }

    static removeDestroyed_rca(actor: iAActor): iAActor {
        Actors108.remove(actor);
        if (objectGroupIs.const(actor[epObjectKey.gp])) {
            rcaRemoveUtil.rcaRemovedUpdate(actor.attrs[epPhysicsLoc.pr].value, actor.gp, actor.gi);
        }
        return actor;
    }

    static removeDestroyedBatch(gb: number, gp: number, gis: number[] | Uint32Array) {
        let actor: iAActor
        aiScope.actorObjMap[gb]?.[gp] && gis?.forEach(gi => {
            actor = AGM.get(aiScope.actorObjMap, gb, gp, gi) as iAActor;
            actor && Actors108.remove(actor);
        })
    }

    // for remove MULTI actors by path arr
    static removeByPathArr(pathArr: iObjectPathArr): iAActor[] {
        const actors =  AGM.removeByPathArr(aiScope.actorObjMap, pathArr) as iAActor[];
        actors.forEach(actor => Actors108._remove(actor));
        return actors;
    }

    // for remove MULTI actors by region id
    static removeRegionActors(rid: int) {
        const actors = [];
        aiScope.actorObjMap[rid] && Object.keys(aiScope.actorObjMap[rid]).forEach((gp) => {
            actors.push(...AGM.removeByPathArr(aiScope.actorObjMap, objPathArr.get(rid, parseInt(gp))) as iAActor[]);
        })
        actors.forEach(actor => Actors108._remove(actor));
        return actors;
    }

    static _addPhysicsBody(actor: iAActor) {
        AActorUtil.physicsActor(actor) && aiScope.bodiesNeedAdd.push(actor);
    }
    static _removePhysicsBody(actor: iAActor) {
        AActorUtil.physicsActor(actor) && aiScope.bodiesNeedRemove.push(actor);
    }


    /**
     * this is not in AACtor class because it made dependency to other important modules
     * @param {iAActor} actor
     */
    static _removeChildren(actor: iAActor) {
        Array.isArray(actor.bindChildActors) && actor.bindChildActors.forEach(child => {
            Actors108.remove(child);
        })
    }
    /**
     * this is not in AACtor class because it made dependency to other important modules
     * @param {iAActor} actor
     */
    static _createChildren(actor: iAActor) {
        // console.log("init children", actor.path.join(","), actor[epAGameBaseOpts.bindChildActors], actor.state.bindChildGPs)
        if (!Array.isArray(actor.bindChildActors) || actor.bindChildActors.length === 0) {
            const childrenBindOpt = actor.state.bindChildGPs;
            if (Array.isArray(childrenBindOpt) === false) return;

            const childrenPathArr: iObjectPathArr[] = childrenBindOpt.map(gp => objPathArr.get(undefined, gp, undefined));
            childrenPathArr.forEach(pathArr => {
                const child = Actors108._createAddChild(actor, pathArr);
                actor.bindChildActors = actor.bindChildActors || [];
                actor.bindChildActors.push(child);
            });
        } else {
            actor.bindChildActors.forEach(childActor => {
                Actors108.addActor(childActor);
            })
        }
    }

    static _createAddChild(actor: iAActor, childPathArr?: iObjectPathArr): iAActor {
        // todo - restructure this part to use different gs shape for each type of child
        let gs: ePhysicsShape = ePhysicsShape.polygon, size: vector2<float>, shape: vector4<float>;
        const gbChild = childPathArr[epObjectGroupPathIndex.gb];
        const gpChild = childPathArr[epObjectGroupPathIndex.gp];
        const giChild = childPathArr[epObjectGroupPathIndex.gi];

        if (objectGroupIs.sensorBind(gpChild)) {
            if (objectGroupIs.sensorBindRotate(gpChild)) {
                // sensor child bind with rotation feature
                gs = ePhysicsShape.circleSector;
                size = [dynamicSensorSize[gpChild] * 2, dynamicSensorSize[gpChild] * 2];
                shape = [dynamicSensorSize[gpChild], 4, Math.PI / 3, - Math.PI / 6];
            } else {
                // sensor child bind
                size = [dynamicSensorSize[gpChild] * 2, dynamicSensorSize[gpChild] * 2];
                shape = [dynamicSensorSize[gpChild], 4, 0, 0];
            }
        }

        const childKeys: iObjectKey = {
            [epObjectKey.gbp]: actor.gb,
            [epObjectKey.gpp]: actor.gp,
            [epObjectKey.gip]: actor.gi,
            [epObjectKey.gb]: gbChild,
            [epObjectKey.gp]: gpChild,
            [epObjectKey.gi]: giChild,
        }
        const sensorOpt: iAActorOpts = {
            [epPhysicsOpt.gs]: gs,
            [epPhysicsOpt.size]: size,
            [epPhysicsOpt.shape]: shape,
            [epPhysicsOpt.pos]: actor.opts[epPhysicsOpt.pos],
        }
        const child = Actors108.createAdd(childKeys, sensorOpt) as iAActor;
        // this unique pathArr ref is important for most case where use path ref as "Set" ref.
        childPathArr[epObjectGroupPathIndex.gi] = child[epObjectKey.gi];
        child.path = childPathArr;
        return child;
    }
}