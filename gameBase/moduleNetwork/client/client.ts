import {eGameUiStage} from "../../../gameClient/script/gameUi/gameUi.enum";
import {eGeckosResState} from "../../../gameClient/script/networking/serverConnectivityAlert";
import {Logger} from "../../../script_base/util/logger";
import {gameConfigWrapper} from "../../gameConfig/game/gameConfig";
import {eBaseDebug} from "../../global/baseDebug";
import {baseScope} from "../../global/baseScope";
import {clientScope} from "../../global/clientScope";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {iWorkerEntryClass} from "../../worker/workerEntryClass.type";
import {iawWorker} from "../../workerAi/aiBase/awBase.type";
import {iawcWorker} from "../../workerAi/aiClient/awClient.type";
import {iWorldClient} from "../../world/worldClient/worldClient.type";
import {eNetEvent} from "../networkEvent.enum";
import {iNetError, iNetEventServerEmit} from "../networkEvent.type";
import {eNetworkPipe} from "../networkPipe.enum";
import {iClientNetworking, iClientNetworkingProps} from "./client.type";

export class ClientNetworking implements iClientNetworking {
    protected _logger = new Logger(eBaseDebug.clientNet);

    protected _world: iWorldClient;
    protected _ae: iWorkerEntryClass<iawWorker>;
    protected _aw: iawWorker;

    constructor(protected _props: iClientNetworkingProps) {
        this._world = clientScope.world;
        this._ae = baseScope.ae;
        this._aw = baseScope.aw;
    }

    public dispose() {
        this._close();
    }

    /**
     * coming in
     */
    protected _onConnect(err?: iNetError): void {
        if (typeof err === "object") {
            if (isNaN(err.status) && err.message && err.message.indexOf("fetch") >= 0) {
                this._props.onServerError(eNetEvent.serverError, "Failed to fetch server address");
            } else if (err.status > 400) {
                switch (err.status) {
                    case eGeckosResState.failedAuth:
                        this._props.onServerError(eNetEvent.authError, "Account auth failed");
                        break;
                    default:
                        this._props.onServerError(eNetEvent.serverError, "Connection denied");
                }
            }
        }

        this._logger.log("connected to server");

        // server need to attach "on" message handler, so should not directly emit for local host
        setTimeout(() => {
            this.emit(eNetEvent.worldCreate, gameConfigWrapper.export());
        }, 50)
    }

    protected _onDisconnect(reason?): void {
        this._logger.log("disconnected from server");
        this._props.onServerError(eNetEvent.serverError, "you are disconnected.");
    }

    protected async _onMsgCommon(eventCode: eNetEvent, data) {
        const {syncUiState} = this._props;

        switch (eventCode) {
            case eNetEvent.worldCreate: {
                syncUiState(eGameUiStage.worldSummary);
                break;
            }
            case eNetEvent.characterVerify: {
                const gpgi: iNetEventServerEmit[eNetEvent.characterVerify] = data;
                clientScope.pgp = gpgi.gp;
                clientScope.pgi = gpgi.gi;
                await (this._aw as iawcWorker).registerPlayer(gpgi.gp, gpgi.gi);

                syncUiState(eGameUiStage.playPreparation);
                break;
            }

            case eNetEvent.serverError: {
                this._props.onServerError(eventCode, data);
                break;
            }
        }
    }

    protected async _onRawCommon(schema: eSchemaMap, rawObj?) {
        switch (schema) {
            default:
        }
    }

    /**
     * going out
     */
    public async emit(eventCode: eNetEvent, msg?, pipe = eNetworkPipe.tcp) {

    }

    /**
     * when having a source object need to send to remote,
     *  - browser mode send source directly,
     *  - C/S mode encode source object, then send to remote
     * @param schema
     * @param rawObj
     * @param pipe
     */
    public async emitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {

    }

    /**
     * when having an encoded object need to send to remote,
     *  - browser mode decode the encoded data, then call local 'remote' onRawMock with source
     *  - C/S mode send encoded directly to remote, remote handle by onRaw
     * @param schema
     * @param encoded
     * @param pipe
     */
    public async emitRawEncoded(schema: eSchemaMap, encoded: Uint8Array, pipe = eNetworkPipe.tcp) {

    }

    protected _close() {

    }
}