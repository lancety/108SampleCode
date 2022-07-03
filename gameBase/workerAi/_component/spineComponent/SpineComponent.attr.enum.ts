import {eAttrConfigIndex, iAttrConfig} from "../../../moduleObject/objectAttrConfig.type";
import {eNodeBasePropsType} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";


export enum epSpineComponentAttrs {
    creationCat = "creationCat",
    creationId = "creationId",
}

export const SpineComponentAttrsConf: iAttrConfig[] = [
    [epSpineComponentAttrs.creationCat, 1, eNodeBasePropsType.number],
    [epSpineComponentAttrs.creationId, 1, eNodeBasePropsType.number],
]

export const SpineComponentAttrsConfMap = {} as {[key in epSpineComponentAttrs]: iAttrConfig};
SpineComponentAttrsConf.forEach(conf => {
    SpineComponentAttrsConfMap[conf[eAttrConfigIndex.name]] = conf;
})