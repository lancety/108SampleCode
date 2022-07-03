import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {iObjectAttrOpts} from "./objectAttr.type";
import {eAttrConfigIndex, iAttrConfig} from "./objectAttrConfig.type";
import {iAActor} from "../workerAi/_class/actorClass/AActor.type";
import {
    ObjectAttr,
    ObjectAttrBool,
    ObjectAttrNum,
    ObjectAttrNumArray,
    ObjectAttrObj,
    ObjectAttrObjArray
} from "./objectAttr";


export const objectAttrUtil = {
    attrInit<P = iObjectAttrOpts>(
        attrConf: iAttrConfig, opts= {} as P,
        actor: iAActor,
        attrVal?: unknown, defaultVal?: unknown
    ) {
        const type = attrConf[eAttrConfigIndex.type];

        const attrClass = _attrClass(type);
        if (attrClass === undefined) return;

        let value, ticking;
        switch (type) {
            case eNodeBasePropsType.int:
            case eNodeBasePropsType.float:
            case eNodeBasePropsType.number:
                if (!isNaN(attrVal as number)) {
                    value = attrVal;
                    ticking = true;
                } else if (!isNaN(defaultVal as number)) {
                    value = defaultVal;
                } else {
                    value = _attrClassVal(type);
                }
                break;
            case eNodeBasePropsType.bool:
                if (attrVal || attrVal === false || attrVal === 0) {
                    value = attrVal;
                    ticking = true;
                } else if (defaultVal || defaultVal === false || defaultVal === 0) {
                    value = defaultVal;
                }  else {
                    value = _attrClassVal(type);
                }
                break;
            case eNodeBasePropsType.string:
                if (attrVal || attrVal === "") {
                    value = attrVal;
                    ticking = true;
                } else if (defaultVal || defaultVal === "") {
                    value = defaultVal;
                } else {
                    value = _attrClassVal(type);
                }
                break;
            default:
                if (attrVal) {
                    value = attrVal;
                    ticking = true;
                } else {
                    value = defaultVal || _attrClassVal(type);
                }
        }
        const attr = (attrClass as any).new(attrConf[eAttrConfigIndex.name], value,
            {
                parent: actor,
                type,
                size: attrConf[eAttrConfigIndex.size],
                schema: attrConf[eAttrConfigIndex.schema],
                ...opts,
            } as iObjectAttrOpts
        )
        if (ticking) {
            ObjectAttr.setTickId(attr);
            actor.state.touchedRep = true;
        }
        return attr;
    },
}



function _attrClass(nodeType: eNodeBasePropsType): ObjectAttr | undefined {
    switch (nodeType) {
        case eNodeBasePropsType.string:
            return ObjectAttr;
        case eNodeBasePropsType.bool:
            return ObjectAttrBool;
        case eNodeBasePropsType.int:
        case eNodeBasePropsType.float:
        case eNodeBasePropsType.number:
            return ObjectAttrNum;
        case eNodeBasePropsType.numberArray:
        case eNodeBasePropsType.vec2:
        case eNodeBasePropsType.vec3:
        case eNodeBasePropsType.vec4:
            return ObjectAttrNumArray;
        case eNodeBasePropsType.obj:
            return ObjectAttrObj;
        case eNodeBasePropsType.objArray:
            return ObjectAttrObjArray;
        default:
            throw "attr undefined" + nodeType
    }
}

function _attrClassVal(nodeType: eNodeBasePropsType): unknown {
    switch (nodeType) {
        case eNodeBasePropsType.string:
            return "";
        case eNodeBasePropsType.bool:
            return false;
        case eNodeBasePropsType.int:
        case eNodeBasePropsType.float:
        case eNodeBasePropsType.number:
            return 0;
        case eNodeBasePropsType.vec2:
            return [0, 0];
        case eNodeBasePropsType.vec3:
            return [0, 0];
        case eNodeBasePropsType.vec4:
            return [0, 0, 0, 0];
        case eNodeBasePropsType.obj:
            return undefined;
        case eNodeBasePropsType.objArray:
            return [];
        default:
            throw "attr undefined" + nodeType
    }
}