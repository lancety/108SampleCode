import {iObjectPathArr} from "../moduleObjectGroup/objectPath.type";
import {eObjectRole} from "./object.role";
import {iObjectKey} from "../moduleObjectGroup/objectKey.type";

/**
 * opts is fixed config options, unlikely change, or the change does not require notice 3rd party entities
 */
interface iObjectBaseOptsAutoFill {
    role?: eObjectRole,
    roleRemote?: eObjectRole,
}
export interface iObjectBaseOpts extends iObjectBaseOptsAutoFill {
}

export interface iObjectBaseAttrs {

}

export interface iObjectBaseState {
    /**
     * flag shows actor's replication attr has been changed
     *  - when ObjectAttr.setVal trigger touchedRep=true when replicate-able attr value cahnged
     *  - manually set state.touchedRep = true when create actor with attr default value
     */
    touchedRep?: boolean,
}

export interface iObjectBase extends iObjectKey{
    path: iObjectPathArr,    // this is const path array reference
    opts: iObjectBaseOpts,          // fixed opts diff among different eObjectGroup classes
    attrs: iObjectBaseAttrs,
    state: iObjectBaseState,
    createTimestamp: number,
}
