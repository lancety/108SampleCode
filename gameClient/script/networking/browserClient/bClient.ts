// client side networking wrapper
import {gameConfig} from "../../../../gameBase/gameConfig/game/gameConfig";
import {clientScope} from "../../../../gameBase/global/clientScope";
import {serverScope} from "../../../../gameBase/global/serverScope";
import {ClientNetworking} from "../../../../gameBase/moduleNetwork/client/client";
import {iClientNetworkingProps} from "../../../../gameBase/moduleNetwork/client/client.type";
import {addLatencyAndPackagesLoss} from "../../../../gameBase/moduleNetwork/debug";
import {eNetEvent} from "../../../../gameBase/moduleNetwork/networkEvent.enum";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";
import {iWorldServerBrowser} from "../../../../gameBase/world/worldServer/worldServerBrowser.type";
import {BSNetworking} from "../browserServer/bServer";
import {BSCNetworking} from "../browserServer/bServerClient";
import {iBSCNetworking} from "../browserServer/bServerClient.type";
import {iBCNetworking} from "./bClient.type";
import {schemaMap} from "../../../../gameBase/moduleSchema/schema.map";

export class BCNetworking extends ClientNetworking implements iBCNetworking{
    protected _world: iWorldServerBrowser;

    protected _serverClient: iBSCNetworking;

    constructor(props: iClientNetworkingProps) {
        super(props);

        serverScope.world = clientScope.world as iWorldServerBrowser;
        serverScope.net = new BSNetworking({
            worldConfig: gameConfig,
        });
        this._serverClient = new BSCNetworking({
            client: this,
        });

        // start shooting requests
        super._onConnect();
    }

    // this is a mocked method for browser's server client to call directly
    // equivalent of tcp.on and udp.on callback
    public async onMsgMock(eventCode: eNetEvent, data?) {
        switch (eventCode) {
            default: await this._onMsgCommon(eventCode, data);
        }
    }

    // this is a mocked method for browser's server client to call directly
    // equivalent of tcp.on(eTcp.raw) and udp.onRaw(), the rawObj is encoded UInt8Array
    public async onRawMock(schema: eSchemaMap, rawObj) {
        await this._onRawCommon(schema, rawObj);
    }


    public async emit(eventCode: eNetEvent, data?) {
        await super.emit(eventCode, data);
        await this._serverClient.onMsgMock(eventCode, data);
    }

    /**
     * for ServerBrowser mode, it should pass source directly
     * @param schema
     * @param rawObj    is source object need to be encoded
     */
    public async emitRaw(schema: eSchemaMap, rawObj) {
        await this._serverClient.onRawMock(schema, rawObj);
    }

    /**
     * always decode the 'encoded' data before calling onRaw
     * @param schema
     * @param encoded   this is always encoded UInt8Array for both browser and geckos mode
     */
    public async emitRawEncoded(schema: eSchemaMap, encoded) {
        await this._serverClient.onRawMock(schema, schemaMap[schema]?.decode(encoded));
    }
}