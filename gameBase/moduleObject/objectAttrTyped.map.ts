import {eSchemaType} from "../moduleSchema/schema.enum";
import {epObjAttrTypedProp} from "./objectAttrTyped.enum";

// object attr schema/attr 'type' to typed prop 'key' map
export const objAttrTypedTKMap = {
    [eSchemaType.int8]: epObjAttrTypedProp.attInt8,
    [eSchemaType.int16]: epObjAttrTypedProp.attInt16,
    [eSchemaType.int32]: epObjAttrTypedProp.attInt32,

    [eSchemaType.uint8]: epObjAttrTypedProp.attUint8,
    [eSchemaType.uint16]: epObjAttrTypedProp.attUint16,
    [eSchemaType.uint32]: epObjAttrTypedProp.attUint32,

    [eSchemaType.float32]: epObjAttrTypedProp.attFloat32,
    [eSchemaType.float64]: epObjAttrTypedProp.attFloat64,

    [eSchemaType.buffer]: epObjAttrTypedProp.attBuffer,
}

// object attr typed prop 'key' to schema/attr 'type' map
export const objAttrTypedKTMap = {};
Object.keys(objAttrTypedTKMap).forEach(tk => {
    const pk = objAttrTypedTKMap[tk];
    objAttrTypedKTMap[pk] = tk;
})