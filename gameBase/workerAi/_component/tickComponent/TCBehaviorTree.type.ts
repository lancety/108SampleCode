import {iBtTreeData} from "../../../../script_module/behaviorEditor/src/behaviorTree/core/nodeData.type";
import {eObjectGroup} from "../../../moduleObjectGroup/objectGroup.enum";
import {iTickComponentProps} from "./TickComponent.type";


export interface iCBehaviorProps extends iTickComponentProps {
    tickFrame: number;
    btTree: iBtTreeData,
    gp: eObjectGroup,
}