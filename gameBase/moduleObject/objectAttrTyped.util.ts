import {int} from "../../script_base/util/number";
import {iObjectPathArr} from "../moduleObjectGroup/objectPath.type";
import {iObjectBase} from "./object.type";
import {iObjectAttr} from "./objectAttr.type";
import {AttrConfigs, AttrConfigsMap} from "./objectAttrConfig.ref";
import {objAttrTypedTKMap} from "./objectAttrTyped.map";
import {
    epObjAttrTyped,
    epObjAttrTypedK,
    epObjAttrTypedPropList,
    epObjAttrTypedV,
    iObjAttrTyped
} from "./objectAttrTyped.enum";
import {eAttrConfigIndex} from "./objectAttrConfig.type";
import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {iObjMap} from "../../script_base/util/object.type";
import {eObjAttrRepMode} from "./objectAttr.enum";
import {serverNetConfig} from "../gameConfig/networking/serverNetConfig";
import {schemaMap} from "../moduleSchema/schema.map";
import {iItemInstance} from "../moduleItem/item.type";
import {eSchemaMap} from "../moduleSchema/schema.enum";
import {epPhysicsBase} from "../modulePhysics/props/physicsBase.enum";

/**
 * encoding / decoding object attrs
 */
export const objectAttrTypedUtil = {
    /**
     * export typed attr buffer for world cache
     * @param obj
     */
    exportCacheAttrTyped(obj: iObjectBase): iObjAttrTyped {
        return objectAttrTypedUtil.attr2TypedBuffer(obj, (attr) => {
            return attr.tickId >= 0 && (attr.opts.bCache || attr.opts.bReplicateMode >= 0);
        });
    },
    /**
     * tcp/udp snapshot replication, which filtered attrs based on replication mode of attr options
     */
    exportRepAttrTyped(obj: iObjectBase, replicateMode: eObjAttrRepMode, runnerTickId: number, force?: boolean): iObjAttrTyped {
        return objectAttrTypedUtil.attr2TypedBuffer(obj, (attr) => {
            // todo - double check if <= will cause duplicated (tickId) replication
            return attr.opts.bReplicateMode === replicateMode && (
                force || (runnerTickId - attr.tickId) <= serverNetConfig.snapWaitFrame
            );
        });
    },

    typedBufferTemplate(pathArr: iObjectPathArr): iObjAttrTyped {
        return {
            [epObjAttrTyped.path]: pathArr,    // x4
            [epObjAttrTyped.attInt8k]: [0],
            [epObjAttrTyped.attInt8v]: [0],

            [epObjAttrTyped.attInt16k]: [0],
            [epObjAttrTyped.attInt16v]: [0],

            [epObjAttrTyped.attInt32k]: [0],
            [epObjAttrTyped.attInt32v]: [0],

            [epObjAttrTyped.attUint8k]: [0],
            [epObjAttrTyped.attUint8v]: [0],

            [epObjAttrTyped.attUint16k]: [0],
            [epObjAttrTyped.attUint16v]: [0],

            [epObjAttrTyped.attUint32k]: [0],
            [epObjAttrTyped.attUint32v]: [0],

            [epObjAttrTyped.attFloat32k]: [0],
            [epObjAttrTyped.attFloat32v]: [0],
            [epObjAttrTyped.attFloat64k]: [0],
            [epObjAttrTyped.attFloat64v]: [0],

            [epObjAttrTyped.attBufferk]: [0],
            [epObjAttrTyped.attBufferv]: [[0]],
        }
    },
    /**
     * return typedContainer object if any attr kv added, otherwise return undefined.
     * @param {iObjectBase} obj                 the object holding attrs
     * @param {(attr) => boolean} filter        external function to check if an attr is wanted
     * @param {iObjAttrTyped} typedBuffer    the attr typed container
     * @returns {iObjAttrTyped}                 the attr typed container
     */
    attr2TypedBuffer(obj: iObjectBase, filter?: (attr: iObjectAttr) => boolean, typedBuffer?: iObjAttrTyped): iObjAttrTyped | undefined {
        let kvEmpty = true;
        typedBuffer = typedBuffer || objectAttrTypedUtil.typedBufferTemplate(obj.path);

        let attrTypedProp, attrTypedVal;
        let kProp: string, vProp: string;

        Object.values(obj.attrs).forEach((attr: iObjectAttr) => {
            if (filter && filter(attr) !== true) return;

            kvEmpty = false;
            attrTypedProp = objAttrTypedTKMap[attr.opts.bufferType];
            kProp = epObjAttrTypedK[attrTypedProp];
            vProp = epObjAttrTypedV[attrTypedProp];
            typedBuffer[kProp] = typedBuffer[kProp] || [];
            typedBuffer[vProp] = typedBuffer[vProp] || [];

            attrTypedVal = objectAttrTypedUtil.getTypedVal(attr.name, attr.opts.type, attr.opts.schema, attr.value);
            if (attrTypedVal === undefined) return;

            try {
                typedBuffer[kProp].push(AttrConfigsMap[attr.name].index);
                if (Array.isArray(attrTypedVal)) {
                    typedBuffer[vProp].push(...attrTypedVal);
                } else {
                    typedBuffer[vProp].push(attrTypedVal);
                }
            } catch (err) {
                console.error(err);
            }
        })

        return kvEmpty ? undefined : typedBuffer;
    },
    typedBuffer2kvMap(attrTypedCont: iObjAttrTyped): iObjMap<unknown> {
        if (attrTypedCont === undefined) return;

        const anchors = {};
        for (let i = 0; i < epObjAttrTypedPropList.length; i++) {
            anchors[epObjAttrTypedPropList[i]] = 1;
        }

        // init output
        const attrKV = {};
        // cache obj attrs
        let kProp: string, vProp: string, ks: int[], vs: unknown[];
        epObjAttrTypedPropList.forEach((prop) => {
            kProp = epObjAttrTypedK[prop];
            vProp = epObjAttrTypedV[prop];
            ks = attrTypedCont[kProp];
            vs = attrTypedCont[vProp];

            // all start from 1 because index 0 is taken by schema encoding for polyfill empty array bug
            for (let i = 1; i < ks.length; i++) {
                const keyCode = ks[i];
                const attrName = AttrConfigs[keyCode][eAttrConfigIndex.name];
                const valSize = AttrConfigs[keyCode][eAttrConfigIndex.size];
                const type = AttrConfigs[keyCode][eAttrConfigIndex.type];
                const schema = AttrConfigs[keyCode][eAttrConfigIndex.schema];

                let tempVal;
                if (valSize > 1) {
                    tempVal = vs.slice(anchors[prop], anchors[prop] + valSize);
                } else if (valSize === 1) {
                    tempVal = vs[anchors[prop]];
                } else {
                    console.error(`unhandled kv of ${attrName}`)
                }
                attrKV[attrName] = objectAttrTypedUtil.getValOfTyped(attrName, type, schema, tempVal);
                anchors[prop] += valSize;
            }
        })
        return attrKV;
    },


    getValOfTyped(name: string, type: eNodeBasePropsType, schema: eSchemaMap, valTyped: unknown): unknown {
        switch (type) {
            // case ObjectAttrStr:
            //     // todo
            //     break;
            case eNodeBasePropsType.bool:
                return !!valTyped;
            case eNodeBasePropsType.int:
            case eNodeBasePropsType.float:
            case eNodeBasePropsType.number:
                return valTyped;
            case eNodeBasePropsType.vec2:
            case eNodeBasePropsType.vec3:
            case eNodeBasePropsType.vec4:
            case eNodeBasePropsType.numberArray:
                return valTyped;
            case eNodeBasePropsType.obj:
                return schemaMap[schema].decode(valTyped as Uint8Array) as iItemInstance;
            case eNodeBasePropsType.objArray: {
                const bufferList = schemaMap[eSchemaMap.bufferList].decode(valTyped as Uint8Array);
                return (bufferList as Uint8Array[]).map(objBuffer => schemaMap[schema].decode(objBuffer));
            }
            default:
                console.error(`${name} value is not processed`, valTyped);
        }
    },

    getTypedVal(name: string, type: eNodeBasePropsType, schema: eSchemaMap, val: unknown): number | number[] | Uint8Array {
        switch (type) {
            // case ObjectAttrStr:
            //     // todo
            //     break;
            case eNodeBasePropsType.bool:
                return val ? 1 : 0;
            case eNodeBasePropsType.int:
            case eNodeBasePropsType.float:
            case eNodeBasePropsType.number:
                return val as number;
            case eNodeBasePropsType.vec2:
            case eNodeBasePropsType.vec3:
            case eNodeBasePropsType.vec4:
            case eNodeBasePropsType.numberArray:
                return val as number[];
            case eNodeBasePropsType.obj:
                return schemaMap[schema].encode(val as iItemInstance);
            case eNodeBasePropsType.objArray: {
                const objBufferList = (val as iItemInstance[]).map(item => schemaMap[schema].encode(item));
                return schemaMap[eSchemaMap.bufferList].encode(objBufferList);
            }
            default:
                console.error(`${name} value is not processed`, val);
        }
    },
}
