import {Logger} from "../../../script_base/util/logger";
import {request_getJSON} from "../../../script_base/util/request";
import {getNodeEnv} from "../../../script_share/@global/env_share.node";
import {getWebEnv} from "../../../script_share/@global/env_share.web";
import {apiInfo} from "../../../script_share/aws/api/apiMapping.agent";
import {eApi_domain, eApi_gp_server, eApi_section} from "../../../script_share/aws/api/apiMapping.type";
import {creationConfigUtil} from "../../gameConfig/creations/creationConfig.util";
import {eBaseDebug} from "../../global/baseDebug";
import {baseScope} from "../../global/baseScope";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {iAiServerEntryClass, iawsWorkerComplete} from "../../workerAi/aiServer/aiServer.type";
import {eNetEvent} from "../networkEvent.enum";
import {eNetworkPipe} from "../networkPipe.enum";
import {iServerNetworking, iServerNetworkingProps} from "./server.type";
import {iServerClientNetworking} from "./serverClient.type";

export class ServerNetworking<SC extends iServerClientNetworking = iServerClientNetworking> implements iServerNetworking{
    protected _ae: iAiServerEntryClass;
    protected _aw: iawsWorkerComplete;

    protected _logger = new Logger(eBaseDebug.serverNet);
    protected _playTokenDecodeKey: string;
    protected _clientSeqId = 1;

    get clientSeqId() {
        return this._clientSeqId++;
    }

    constructor(protected _props: iServerNetworkingProps) {
        this._ae = baseScope.ae as iAiServerEntryClass;
        this._aw = baseScope.aw as iawsWorkerComplete;

        this._init();
    }

    public dispose() {
        this._close();
    }

    protected _close() {

    }

    protected async _init() {
        this._logger.log("Server loading...");
        const results = await Promise.all([
            this._initDecodeKey(),
            creationConfigUtil.controllableCreationTemplate()
        ])

        if (results.indexOf(undefined) >= 0) {
            this._logger.error("[x] Server initiation failed.")
        } else {
            this._logger.log("[v] Server ready.");
        }
    }

    protected async _initDecodeKey() {
        const env = typeof window === "undefined" ? getNodeEnv() : getWebEnv();
        const api = apiInfo(env, eApi_domain.game_pub, eApi_section.gp_server, eApi_gp_server.pubKey);
        this._logger.log("Loading play token decode key...", api.url);

        return await request_getJSON<string>(api.url).then((res) => {
            this._playTokenDecodeKey = res.json;
            return this._playTokenDecodeKey;
        }).catch(err => {
            this._logger.error("Loading play token decode key failed.");
        })
    }

    /**
     * going out
     */
    public async emit(eventName: eNetEvent, msg?, pipe = eNetworkPipe.tcp) {
    }

    public async emitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
    }

    /**
     *
     * @param eventName
     * @param msg
     * @param roomId    emit to room users, OR not roomed users if not set
     * @param pipe
     */
    public async roomEmit(eventName: eNetEvent, msg?, roomId?, pipe = eNetworkPipe.tcp) {
    }

    public async roomEmitRaw(schema: eSchemaMap, rawObj, roomId?, pipe = eNetworkPipe.tcp) {
    }


    // /**
    //  * event listener
    //  * @private
    //  */
    // private _eventCallbacks: {
    //     [value in eServerEvent]: {
    //         cb: (data) => void,
    //         once: boolean,  // only call once
    //     }[]
    // } = {} as any;
    //
    // public on(event: eServerEvent, cb) {
    //     this._eventCallbacks[event] = this._eventCallbacks[event] || [];
    //     this._eventCallbacks[event].push({
    //         cb,
    //         once: false,
    //     });
    // }
    //
    // public one(event: eServerEvent, cb) {
    //     this._eventCallbacks[event] = this._eventCallbacks[event] || [];
    //     this._eventCallbacks[event].push({
    //         cb,
    //         once: true
    //     });
    // }
    //
    // public off(event: eServerEvent, cb) {
    //     const cbIndex = this._eventCallbacks[event]?.findIndex(cb);
    //     this._eventCallbacks[event]?.splice(cbIndex, 1);
    // }
    //
    // public async trigger(event: eServerEvent, data: unknown) {
    //     const callbacks = this._eventCallbacks[event] || [];
    //     for (const callback of callbacks) {
    //         await callback.cb(data);
    //     }
    //     for (let i = callbacks.length - 1; i >= 0; i--) {
    //         if (callbacks[i].once) {
    //             callbacks.splice(i, 1);
    //         }
    //     }
    // }
}