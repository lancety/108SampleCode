import {int} from "../../../script_base/util/number";
import {iGameConfig} from "../../gameConfig/game/gameConfig.type";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {eNetEvent} from "../networkEvent.enum";
import {eNetworkPipe} from "../networkPipe.enum";
import {iServerClientNetworking} from "./serverClient.type";

export interface iServerEventData {

}


export interface iServerNetworkingProps {
    worldConfig: iGameConfig,
}

export interface iServerNetworking<SC = iServerClientNetworking> {
    clientSeqId: int,   // incremental seq id for new clients

    dispose(): void,

    emit: (eventCode: eNetEvent, msg?, pipe?: eNetworkPipe) => Promise<void>,
    emitRaw: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
    roomEmit: (eventCode: eNetEvent, msg?, roomId?, pipe?: eNetworkPipe) => Promise<void>,
    roomEmitRaw: (schema: eSchemaMap, rawObj, roomId?, pipe?: eNetworkPipe) => Promise<void>,
}