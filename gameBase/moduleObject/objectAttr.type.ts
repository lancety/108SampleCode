import {LinkedListDouble} from "../../script_base/util/linkedListDouble";
import {int} from "../../script_base/util/number";
import {eSchemaMap, eSchemaType} from "../moduleSchema/schema.enum";
import {iObjectBase} from "./object.type";
import {eObjAttrRepMode, eObjectAttrType} from "./objectAttr.enum";
import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";

export interface iObjectAttrOpts {
    /*
    *
    * copied from attrConf array
    *
    * */
    size?: int,
    type?: eNodeBasePropsType,
    schema?: eSchemaMap,  // when attrConf.type is "obj" or "objArray", this get value from attrConf.schema

    /*
    *
    * manually set when create
    *
    * */
    parent?: iObjectBase,
    bufferType?: eSchemaType,   // buffer type of this attr

    // cache - if attr DOESN'T have "bReplicateMode", use  it to force cache to game db
    bCache?: boolean,
    // cs - replication mode (tcp/udp) of the server snapshot
    bReplicateMode?: eObjAttrRepMode,
    // cs - actor eObjectRepRole.simulate
    // - the replicated attr need interpolate its value (normally number value)
    bInterpolate?: boolean,
    // cs - actor eObjectRepRole.autonomous
    // - owned/managed by client side,
    // - adjusted based on replication snapshot with same ctrl seqId
    bReconcile?: boolean,

    bRender?: boolean,  // render - render need this attr for display purpose
}

export interface iObjectAttrReplicate<T = unknown> {
    valRep?: T,         // replicated value
    localTime?: int,    // local time when taking record
    serverTime: int,    // server time of this value when changed
}
export interface iObjectAttr<T = unknown> {
    name: string,
    opts: iObjectAttrOpts,
    value?: T,          // from physics or ai worker sync
    tickId?: int,      // last modified id - aiRunner.tickId

    replicates?: LinkedListDouble<iObjectAttrReplicate<T>>,  // bInterpolate attr's target/final replicating value
    replicateNext?: iObjectAttrReplicate,   // the next snapshot actor attr have not processed & as interp target
}

/**
 * min, max is used for limiting value change on server side only. if min max is used for client, make its value as number[] - vec3[]: [current, min, max]
 */
export interface iObjectAttrNumOpts extends iObjectAttrOpts {
    min?: number,
    max?: number,
}
export interface iObjectAttrNum extends iObjectAttr<number> {
    opts: iObjectAttrNumOpts,
    value?: number,
}

export interface iObjectAttrStr extends iObjectAttr<string> {
    value?: string,
}

export interface iObjectAttrBool extends iObjectAttr<boolean> {
    value?: boolean,
}


export interface iObjectAttrNumArrayOpts extends iObjectAttrNumOpts {
    size: number,
}
export interface iObjectAttrNumArray extends iObjectAttr<number[]> {
    value?: number[],
}

export interface iObjectAttrObjOpts extends iObjectAttrOpts {

}
export interface iObjectAttrObj<T> extends iObjectAttr<T> {
    value?: T,
}

export interface iObjectAttrObjArrayOpts extends iObjectAttrObjOpts {
    size: number
}
export interface iObjectAttrObjArray<T> extends iObjectAttr<T[]> {
    value?: T[],
}