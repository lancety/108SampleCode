import {eAttrConfigIndex, iAttrConfig} from "../../../moduleObject/objectAttrConfig.type";
import {eNodeBasePropsType} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";


export enum epACharacterAttrs {
    moveState = "moveState",
    moveSpeed = "moveSpeed",    // walk/run/swim speed (m/s) - different to iAActor.attrs.speed which is physics speed
    idlePos = "idlePos",
}


export const ACharacterAttrsConf: iAttrConfig[] = [
    [epACharacterAttrs.moveState, 1, eNodeBasePropsType.number],
    [epACharacterAttrs.moveSpeed, 1, eNodeBasePropsType.number],
    [epACharacterAttrs.idlePos, 2, eNodeBasePropsType.vec2],
]

export const ACharacterAttrsConfMap = {} as {[key in epACharacterAttrs]: iAttrConfig};
ACharacterAttrsConf.forEach(conf => {
    ACharacterAttrsConfMap[conf[eAttrConfigIndex.name]] = conf;
})