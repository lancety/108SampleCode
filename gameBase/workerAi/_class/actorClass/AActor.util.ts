import {iAActor} from "./AActor.type";
import {vector2} from "../../../../script_base/@type/graph";
import {float} from "../../../../script_base/util/number";
import {epObjectKey, iObjectKey} from "../../../moduleObjectGroup/objectKey.type";
import {iServerSnapshotActorOpts} from "../../../moduleActor/AUdpSnapshot.type";
import {epPhysicsOpt} from "../../../modulePhysics/opts/physicsOpt.enum";
import {graphVec2} from "../../../../script_base/graph/vec2";
import {objectGroupIs} from "../../../moduleObjectGroup/objectGroup.util";
import {iAThing} from "./AThing.type";

export const AActorUtil = {
    pos(actor: iAActor): vector2<float> {
        return [actor.attrs.px.value, actor.attrs.py.value];
    },
    /**
     * random position around given actor, with random distance within given range (meter)
     * @param actor
     * @param distance
     * @param radian
     */
    posAround(actor: iAActor, distance: float, radian?: float) {
        return graphVec2.add(
            [],
            AActorUtil.pos(actor),
            graphVec2.pointOfRadianLength(radian || Math.random() * Math.PI * 2, distance),    // 1 meter extra
        );
    },
    physicsActor(actor: iAActor) {
        return objectGroupIs.collideFilter(actor[epObjectKey.gp]);
    },
    actorKeysTypedSafe(actor: iAThing): iObjectKey {
        return {
            gb: actor[epObjectKey.gb],
            gp: actor[epObjectKey.gp],
            gi: actor[epObjectKey.gi],
            gbp: actor[epObjectKey.gbp] || 0,
            gpp: actor[epObjectKey.gpp] || 0,
            gip: actor[epObjectKey.gip] || 0,
        }
    },
    actorOptsTypedSafe(actor: iAActor): iServerSnapshotActorOpts {
        const {opts} = actor;
        const optsCopy: iServerSnapshotActorOpts = {
            [epPhysicsOpt.gs]: opts[epPhysicsOpt.gs] || 0,
            [epPhysicsOpt.size]: opts[epPhysicsOpt.size] || [0, 0], // invisible actor dont have size, only for sprites
            [epPhysicsOpt.shape]: opts[epPhysicsOpt.shape] || [0, 0, 0, 0],

            [epPhysicsOpt.pos]: AActorUtil.pos(actor),  // todo - always use new pos??
            [epPhysicsOpt.vertices]: opts[epPhysicsOpt.vertices] && opts[epPhysicsOpt.vertices].length > 0 ? opts[epPhysicsOpt.vertices] : [0],
            [epPhysicsOpt.scaleX]: opts[epPhysicsOpt.scaleX] || 1,
            [epPhysicsOpt.scaleY]: opts[epPhysicsOpt.scaleY] || 1,
            [epPhysicsOpt.scaleVolume]: opts[epPhysicsOpt.scaleVolume] || 1,
        };

        return optsCopy;
    },
}