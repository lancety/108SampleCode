import {eGameUiStage} from "../../../gameClient/script/gameUi/gameUi.enum";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {eNetEvent} from "../networkEvent.enum";
import {eNetworkPipe} from "../networkPipe.enum";

export interface iClientNetworkingProps {
    syncUiState: (newState: eGameUiStage, playStateReady?: boolean) => void,
    onServerError: (code: eNetEvent, err) => void,
}


export interface iClientNetworking {
    dispose():void,

    emit: (eventCode: eNetEvent, msg?, pipe?: eNetworkPipe) => Promise<void>,
    emitRaw: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
    emitRawEncoded: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
}