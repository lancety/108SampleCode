import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {eSchemaMap} from "../moduleSchema/schema.enum";


export enum eAttrConfigIndex {
    name,
    size,
    type,           // used as behavior tree node val
    enumVK,
    schema,         // schemaMap enum name
}

/**
 * index is dynamically generated based on the collection of attrs used for the game
 * including custom implementation of child AActor classes
 *
 * array items
 *  0. {string} attr name
 *  1. {number} size of item (1) or array (+)
 *  2. {eNodeBasePropsType} the attribute type in the scenario of behavior tree and behavior tree editor
 *  3. {iObjMap<unknown>} enum key & value used by the attribute (normally it is the enum with name format 'epXXXX')
 */
export type iAttrConfig<V = unknown> = [string, number, eNodeBasePropsType, [unknown, string][]?, eSchemaMap?] & { index?: number };