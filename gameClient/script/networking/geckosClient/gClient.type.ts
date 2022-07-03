import {iClientNetworking} from "../../../../gameBase/moduleNetwork/client/client.type";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";
import {eNetworkPipe} from "../../../../gameBase/moduleNetwork/networkPipe.enum";

export interface iGCNetworking extends iClientNetworking {
    emitRawEncoded: (schema: eSchemaMap, rawObj, pipe?: eNetworkPipe) => Promise<void>,
}