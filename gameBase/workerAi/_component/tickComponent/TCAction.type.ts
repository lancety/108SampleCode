import {iTickComponentProps} from "./TickComponent.type";
import {eBtTickStatus} from "../../../../script_module/behaviorEditor/src/behaviorTree/bt.enum";
import {eAiAction} from "../../../moduleAction/action.enum";

export interface iACActionProps extends iTickComponentProps{

}

/**
 * in some case an action processed and the final animation need to be something else - e.g.
 * beaten action with 0 health change result caused destroyed, so instead of beaten it needs to be destroyed action.
 */
export type iACActionHandleOutput = eBtTickStatus | [eAiAction];