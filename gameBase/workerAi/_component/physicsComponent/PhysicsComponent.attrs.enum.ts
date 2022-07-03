import {iAttrConfig} from "../../../moduleObject/objectAttrConfig.type";
import {epPhysicsLoc, PhysicsLocAttrsConf, PhysicsLocAttrsConfMap} from "../../../modulePhysics/props/physicsLoc.type";
import {
    epPhysicsBase,
    PhysicsBaseAttrsConf,
    PhysicsBaseAttrsConfMap
} from "../../../modulePhysics/props/physicsBase.enum";

export const epPhysicsComponentAttrs = {
    ...epPhysicsBase,
    ...epPhysicsLoc,
}
export type epPhysicsComponentAttrs = (typeof epPhysicsComponentAttrs)[keyof typeof epPhysicsComponentAttrs];

export const PhysicsComponentAttrsConf: iAttrConfig[] = [
    ...PhysicsBaseAttrsConf,
    ...PhysicsLocAttrsConf,
]

export const PhysicsComponentAttrsConfMap = {
    ...PhysicsBaseAttrsConfMap,
    ...PhysicsLocAttrsConfMap,
} as { [key in epPhysicsComponentAttrs]: iAttrConfig };