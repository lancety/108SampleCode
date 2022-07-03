import {eNetEvent} from "../../../../gameBase/moduleNetwork/networkEvent.enum";
import {iServerClientNetworking} from "../../../../gameBase/moduleNetwork/server/serverClient.type";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";

export interface iBSCNetworking extends iServerClientNetworking{
    onMsgMock(eventCode: eNetEvent, msg?): Promise<void>
    onRawMock(schema: eSchemaMap, rawobj): Promise<void>

}