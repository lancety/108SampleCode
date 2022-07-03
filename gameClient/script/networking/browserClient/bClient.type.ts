import {iClientNetworking} from "../../../../gameBase/moduleNetwork/client/client.type";
import {eNetEvent} from "../../../../gameBase/moduleNetwork/networkEvent.enum";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";

export interface iBCNetworking extends iClientNetworking {
    onMsgMock: (eventCode: eNetEvent, data?) => Promise<void>,
    onRawMock: (schema: eSchemaMap, rawObj) => Promise<void>,
}