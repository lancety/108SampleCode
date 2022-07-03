import {eAbsAction, eAiAction} from "../../../moduleAction/action.enum";
import {TCAction} from "../../_component/tickComponent/TCAction";
import {iAActor} from "./AActor.type";
import {iACharacter} from "./ACharacter.type";


export class AActorAction<A extends iAActor = iAActor> extends TCAction {
    constructor(protected _props) {
        super(_props);
    }

    public convertMainToSubAction(actor: iACharacter, actMain: eAbsAction): eAiAction {
        return;
    }
}