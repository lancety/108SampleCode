import {enumUtil} from "../../script_base/util/enum";
import {float, int} from "../../script_base/util/number";

export enum epObjAttrTypedProp {
    attInt8 = "attInt8",
    attInt16 = "attInt16",
    attInt32 = "attInt32",

    attUint8 = "attUint8",
    attUint16 = "attUint16",
    attUint32 = "attUint32",

    attFloat32 = "attFloat32",
    attFloat64 = "attFloat64",

    attBuffer = "attBuffer",
}
export const epObjAttrTypedPropList = enumUtil.enumKey(epObjAttrTypedProp) as epObjAttrTypedProp[];

export enum epObjAttrTyped {
    path = "path",    // x4
    attInt8k = "attInt8k",
    attInt8v = "attInt8v",

    attInt16k = "attInt16k",
    attInt16v = "attInt16v",

    attInt32k = "attInt32k",
    attInt32v = "attInt32v",

    attUint8k = "attUint8k",
    attUint8v = "attUint8v",

    attUint16k = "attUint16k",
    attUint16v = "attUint16v",

    attUint32k = "attUint32k",
    attUint32v = "attUint32v",

    attFloat32k = "attFloat32k",
    attFloat32v = "attFloat32v",
    attFloat64k = "attFloat64k",
    attFloat64v = "attFloat64v",

    attBufferk = "attBufferk",
    attBufferv = "attBufferv",
}

export interface iObjAttrTyped {
    [epObjAttrTyped.path]: int[],    // x4
    [epObjAttrTyped.attInt8k]: int[],
    [epObjAttrTyped.attInt8v]: int[],

    [epObjAttrTyped.attInt16k]: int[],
    [epObjAttrTyped.attInt16v]: int[],

    [epObjAttrTyped.attInt32k]: int[],
    [epObjAttrTyped.attInt32v]: int[],

    [epObjAttrTyped.attUint8k]: int[],
    [epObjAttrTyped.attUint8v]: int[],

    [epObjAttrTyped.attUint16k]: int[],
    [epObjAttrTyped.attUint16v]: int[],

    [epObjAttrTyped.attUint32k]: int[],
    [epObjAttrTyped.attUint32v]: int[],

    [epObjAttrTyped.attFloat32k]: int[],
    [epObjAttrTyped.attFloat32v]: float[],
    [epObjAttrTyped.attFloat64k]: int[],
    [epObjAttrTyped.attFloat64v]: float[],

    [epObjAttrTyped.attBufferk]: int[],
    [epObjAttrTyped.attBufferv]: int[][],
}


export const epObjAttrTypedK = {
    [epObjAttrTypedProp.attInt8]: epObjAttrTyped.attInt8k,
    [epObjAttrTypedProp.attInt16]: epObjAttrTyped.attInt16k,
    [epObjAttrTypedProp.attInt32]: epObjAttrTyped.attInt32k,

    [epObjAttrTypedProp.attUint8]: epObjAttrTyped.attUint8k,
    [epObjAttrTypedProp.attUint16]: epObjAttrTyped.attUint16k,
    [epObjAttrTypedProp.attUint32]: epObjAttrTyped.attUint32k,

    [epObjAttrTypedProp.attFloat32]: epObjAttrTyped.attFloat32k,
    [epObjAttrTypedProp.attFloat64]: epObjAttrTyped.attFloat64k,

    [epObjAttrTypedProp.attBuffer]: epObjAttrTyped.attBufferk,
}

export const epObjAttrTypedV = {
    [epObjAttrTypedProp.attInt8]: epObjAttrTyped.attInt8v,
    [epObjAttrTypedProp.attInt16]: epObjAttrTyped.attInt16v,
    [epObjAttrTypedProp.attInt32]: epObjAttrTyped.attInt32v,

    [epObjAttrTypedProp.attUint8]: epObjAttrTyped.attUint8v,
    [epObjAttrTypedProp.attUint16]: epObjAttrTyped.attUint16v,
    [epObjAttrTypedProp.attUint32]: epObjAttrTyped.attUint32v,

    [epObjAttrTypedProp.attFloat32]: epObjAttrTyped.attFloat32v,
    [epObjAttrTypedProp.attFloat64]: epObjAttrTyped.attFloat64v,

    [epObjAttrTypedProp.attBuffer]: epObjAttrTyped.attBufferv,
}
