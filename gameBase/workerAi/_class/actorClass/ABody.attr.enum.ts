import {eActionAnimTrackLength} from "../../../moduleAction/anim/aiActionAnim.type";
import {eAttrConfigIndex, iAttrConfig} from "../../../moduleObject/objectAttrConfig.type";
import {eNodeBasePropsType} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {epABodyStatusNKArr} from "./ABody.enum";

export enum epABodyAttrs {
    // these 3 are used for render playing new animation, so it never should care about exist value when updating
    anim = "anim",                  // [track0, track1, track2, track3] anim enum index
    animTickId = "animTickId",      // [tickId, tickId, tickId, tickId] the ai runner tick id when modified track anim
    animDuration = "animDuration",  // [track0, track1, track2, track3] second
    actCooldown = "actCooldown",    // float - waiting from current anim end till recall again, in seconds

    hpMax = "hpMax",
    hp = "hp",
    toolHittable = "toolHittable",

    status = "status",
    statusTimestamp = "statusTimestamp",
}

export const ABodyAttrsConf: iAttrConfig[] = [
    [epABodyAttrs.anim, eActionAnimTrackLength, eNodeBasePropsType.vec4],
    [epABodyAttrs.animTickId, eActionAnimTrackLength, eNodeBasePropsType.vec4],
    [epABodyAttrs.animDuration, eActionAnimTrackLength, eNodeBasePropsType.vec4],
    [epABodyAttrs.actCooldown, 1, eNodeBasePropsType.number],

    [epABodyAttrs.hp, 1, eNodeBasePropsType.number],
    [epABodyAttrs.hpMax, 1, eNodeBasePropsType.number],
    [epABodyAttrs.toolHittable, 1, eNodeBasePropsType.bool],

    [epABodyAttrs.status, 1, eNodeBasePropsType.number, epABodyStatusNKArr],
    [epABodyAttrs.statusTimestamp, 1, eNodeBasePropsType.number],
]

export const ABodyAttrsConfMap = {} as {[key in epABodyAttrs]: iAttrConfig};
ABodyAttrsConf.forEach(conf => {
    ABodyAttrsConfMap[conf[eAttrConfigIndex.name]] = conf;
})