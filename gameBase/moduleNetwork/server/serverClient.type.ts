import {iPlayToken} from "../../../script_base/account/playToken.type";
import {iPlayerStatus} from "../../gameConfig/player/playerStatus.type";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {eNetEvent} from "../networkEvent.enum";
import {eNetworkPipe} from "../networkPipe.enum";

export interface iServerClientUserData {
    creatorToken?: string,  // web api token
    playToken: string,      // game api token

    playerInfo: iPlayToken,    // player summary info - only basic ones used for gameplay
}

export interface iServerClientNetworking {
    userData: iServerClientUserData,
    accUuid: string,
    selfStatus: iPlayerStatus,

    onConnected: ()=>Promise<void>
    onDisconnected: ()=>Promise<void>

    emit: (eventCode: eNetEvent, msg?, pipe?: eNetworkPipe) => Promise<void>,
    emitRaw: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
    emitRawEncoded: (schema: eSchemaMap, encoded, pipe?) => Promise<void>,
    roomEmit: (eventCode: eNetEvent, msg?, roomId?, pipe?: eNetworkPipe) => Promise<void>,
    roomEmitRaw: (schema: eSchemaMap, rawObj, roomId?, pipe?: eNetworkPipe) => Promise<void>,
    broadcastEmit: (eventCode: eNetEvent, msg?, pipe?: eNetworkPipe) => Promise<void>,
    broadcastEmitRaw: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
}