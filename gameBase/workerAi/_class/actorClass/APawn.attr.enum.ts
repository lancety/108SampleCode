import {eAttrConfigIndex, iAttrConfig} from "../../../moduleObject/objectAttrConfig.type";
import {eNodeBasePropsType} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";

export enum epAPawnAttrs {
    epMax = "epMax",
    ep = "ep",
    lifeMax = "lifeMax",
    life = "life",
}

export const APawnAttrsConf: iAttrConfig[] = [
    [epAPawnAttrs.epMax, 1, eNodeBasePropsType.number],
    [epAPawnAttrs.ep, 1, eNodeBasePropsType.number],
    [epAPawnAttrs.lifeMax, 1, eNodeBasePropsType.number],
    [epAPawnAttrs.life, 1, eNodeBasePropsType.number],
]

export const APawnAttrsConfMap = {} as {[key in epAPawnAttrs]: iAttrConfig};
APawnAttrsConf.forEach(conf => {
    APawnAttrsConfMap[conf[eAttrConfigIndex.name]] = conf;
})