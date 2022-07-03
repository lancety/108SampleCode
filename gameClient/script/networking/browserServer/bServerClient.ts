import {eNetEvent} from "../../../../gameBase/moduleNetwork/networkEvent.enum";
import {ServerClientNetworking} from "../../../../gameBase/moduleNetwork/server/serverClient";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";
import {accountCache} from "../../../../script_base/account/accountCache";
import {eAccountResponse} from "../../../../script_base/aws/gateway/accountResponse.type";
import {iBCNetworking} from "../browserClient/bClient.type";
import {iBSCNetworking} from "./bServerClient.type";
import {schemaMap} from "../../../../gameBase/moduleSchema/schema.map";

interface iBSCNetworkingProps {
    client: iBCNetworking,
}

export class BSCNetworking extends ServerClientNetworking implements iBSCNetworking{
    protected _client: iBCNetworking;

    constructor(protected _props: iBSCNetworkingProps) {
        super(_props);

        this._client = this._props.client;
        this.userData = {
            creatorToken: accountCache[eAccountResponse.userToken],
            playToken: accountCache[eAccountResponse.playToken],
            // mock playToken object for browser server so dont need to do RSA decryption
            playerInfo: {...accountCache, expire: accountCache[eAccountResponse.tokenExpireAt]}
        };
        this._logger.log("new browser server client instance");

        this.onConnected();
    }

    public async onConnected(err?) {
        await super.onConnected(err);
    }

    // this is a mocked method for client to call directly
    public async onMsgMock(eventCode: eNetEvent, data?) {
        switch (eventCode) {
            // all rest events do not need geckos to process data, directly call super
            default: {
                await this._onMsgCommon(eventCode, data);
            }
        }
    }

    // this is a mocked method for client to call directly
    public async onRawMock(schema: eSchemaMap, rawObj) {
        switch (schema) {
            case eSchemaMap.inputControl: {
                await this._aw.handleClientCtrlOnServer(rawObj, this.selfStatus.clientSeqId);
                break;
            }
            default:
                await this._onRawCommon(schema, rawObj);
        }
    }


    public async emit(eventCode: eNetEvent, msg?) {
        await super.emit(eventCode, msg);

        switch (eventCode) {
            case eNetEvent.characterVerify: {
                this._client.onMsgMock(eventCode, msg);
                break;
            }
            default:
                this._client.onMsgMock(eventCode, msg);
        }
    }

    public async emitRaw(schema: eSchemaMap, rawObj) {
        await this._client.onRawMock(rawObj, schema);
    }
    public async emitRawEncoded(schema: eSchemaMap, encoded) {
        await this._client.onRawMock(schema, schemaMap[schema]?.decode(encoded));
    }
}
