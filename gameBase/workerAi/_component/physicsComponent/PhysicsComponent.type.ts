import {epPhysicsBase} from "../../../modulePhysics/props/physicsBase.enum";
import {iObjectAttrNum} from "../../../moduleObject/objectAttr.type";
import {epPhysicsLoc} from "../../../modulePhysics/props/physicsLoc.type";


export interface iPhysicsComponentAttrs {
    [epPhysicsBase.px]: iObjectAttrNum,
    [epPhysicsBase.py]: iObjectAttrNum,
    [epPhysicsBase.angle]: iObjectAttrNum,
    [epPhysicsBase.vx]: iObjectAttrNum,
    [epPhysicsBase.vy]: iObjectAttrNum,
    [epPhysicsBase.speed]: iObjectAttrNum,

    [epPhysicsLoc.pr]: iObjectAttrNum,    // position - region
    [epPhysicsLoc.pz]: iObjectAttrNum,    // position - zone
    [epPhysicsLoc.pf]: iObjectAttrNum,    // position - floor
    [epPhysicsLoc.pa]: iObjectAttrNum,    // position - area
}