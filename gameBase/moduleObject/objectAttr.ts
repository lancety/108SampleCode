import {graphUtil} from "../../script_base/graph/graph.util";
import {LinkedListDouble} from "../../script_base/util/linkedListDouble";
import {baseScope} from "../global/baseScope";
import {eEngineMode} from "../global/baseScope.enum";
import {iAActor} from "../workerAi/_class/actorClass/AActor.type";
import {
    iObjectAttr,
    iObjectAttrNum,
    iObjectAttrNumArray,
    iObjectAttrNumOpts,
    iObjectAttrObjArray,
    iObjectAttrOpts,
    iObjectAttrReplicate,
} from "./objectAttr.type";
import {actorGroupClassRef} from "../workerAi/_class/actorGroup/actorGroupClass.ref";
import {epObjectKey} from "../moduleObjectGroup/objectKey.type";
import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {AThing} from "../workerAi/_class/actorClass/AThing";

export class ObjectAttr {
    static onValueUpdate(attr: iObjectAttr, newVal: unknown) {

    }

    static onReplicating(attr: iObjectAttr, newVal: unknown) {
        if (baseScope.engineMode !== eEngineMode.clientGeckos) {
            return; // only clientGeckos need replication
        }

        actorGroupClassRef<AThing>((attr.opts.parent[epObjectKey.gp])).onAttrRep(attr.opts.parent as iAActor, attr, newVal);
    }


    static setTickId(attr: iObjectAttr) {
        attr.tickId = (attr.opts.parent as iAActor).state.tickIdLastUpdate = globalThis.runner.tickId;
        if (attr.opts.bReplicateMode >= 0) {
            (attr.opts.parent as iAActor).state.touchedRep = true;
        }
    }

    static min: number;
    static max: number;
    static valNumClamp(attr: iObjectAttrNum, val: number): number {
        if (isNaN(val as number)) {
            val = 0;
        } else {
            const {min, max} = attr.opts as iObjectAttrNumOpts;
            val = graphUtil.clamp(val, isNaN(min) ? -Infinity : min, isNaN(max) ? Infinity : max);
        }
        return val;
    }

    /*
    *
    * val
    *
    * */

    /**
     * set value to attr object
     * @param attr
     * @param val
     */
    static setVal(attr: iObjectAttr, val: unknown) {
        if (attr === undefined) {
            console.warn('try to change undefined attr');
        }

        try {
            switch (attr.opts.type) {
                case eNodeBasePropsType.bool: {
                    if (attr.value === !!val) return;
                    val = !!val;
                    break;
                }
                case eNodeBasePropsType.int:
                case eNodeBasePropsType.float:
                case eNodeBasePropsType.number: {
                    if (isNaN(val as number)) return;
                    if (Math.abs(attr.value as number - (val as number)) < 0.0001) return;
                    val = ObjectAttr.valNumClamp(attr as iObjectAttrNum, val as number);
                    break;
                }
                case eNodeBasePropsType.vec2:
                case eNodeBasePropsType.vec3:
                case eNodeBasePropsType.vec4:
                case eNodeBasePropsType.numberArray:
                    if (Array.isArray(val) === false) return;

                    for (let i = 0; i < attr.opts.size; i++) {
                        val[i] = ObjectAttr.valNumClamp(attr as iObjectAttrNum, val[i] as number);
                    }
                    break;
            }
        } catch (err) {
            console.error("could not fully process attr set", val, 'err', err);
        }

        ObjectAttr.onValueUpdate(attr, val);
        ObjectAttr.setTickId(attr);
        attr.value = val;
    }

    /*
    *
    * val of replication
    *
    * */

    /**
     * this is for server replication on client side, only for CS mode game
     * set value to attr object, before value change, trigger onReplicating to call behaviors watching this replication
     * @param attr
     * @param val
     */
    static setValRep(attr: iObjectAttr, val: unknown) {
        ObjectAttr.onReplicating(attr, val);
        ObjectAttr.setVal(attr, val);
    }

    /**
     * cache current replicate value, and set as val if required
     * @param attr
     * @param val
     * @param serverTime
     * @param localTime
     */
    static cacheRepForInterpolation(attr: iObjectAttr, val: unknown, serverTime: number, localTime: number) {
        ObjectAttr.onReplicating(attr, val);
        attr.replicates = attr.replicates || new LinkedListDouble<iObjectAttrReplicate>((a, b) => a.serverTime - b.serverTime);
        attr.replicates.insertL2S({
            valRep: val,
            serverTime,
            localTime,
        });
        attr.replicates.ltTake({serverTime: serverTime - 2000});
    }

    /**
     * cache next value from server replication
     * @param attr
     * @param val
     * @param serverTime
     * @param localTime
     */
    static cacheRepNext(attr: iObjectAttr, val: unknown | undefined, serverTime: number, localTime: number) {
        if (val === undefined) {
            if (attr.replicateNext && attr.replicateNext.serverTime < serverTime) {
                attr.replicateNext = undefined;
            }
        } else {
            attr.replicateNext = {
                valRep: val,
                serverTime,
                localTime,
            }
        }
    }

    static new(name: string, value: unknown, opts: iObjectAttrOpts) {
        const attr = {name, value, opts} as iObjectAttr;
        return attr;
    }
}

export class ObjectAttrStr extends ObjectAttr {

}

export class ObjectAttrBool extends ObjectAttr {
    static setVal(attr: iObjectAttr, val: boolean) {
        super.setVal(attr, val);
    }
}

export class ObjectAttrNum extends ObjectAttr {

}

export class ObjectAttrNumArray extends ObjectAttr {
    static setValAtIndex(attr: iObjectAttrNumArray, val: number, index: number) {
        ObjectAttr.setTickId(attr);
        attr.value[index] = val;
    }
}

export class ObjectAttrObj extends ObjectAttr {

}

export class ObjectAttrObjArray extends ObjectAttr {
    static setValAtIndex(attr: iObjectAttrObjArray<unknown>, val: unknown, index: number) {
        ObjectAttr.setTickId(attr);
        attr.value[index] = val;
    }
}