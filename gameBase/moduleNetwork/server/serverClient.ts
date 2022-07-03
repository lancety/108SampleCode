import {te_account} from "../../../script_base/aws/dynamodb/tableMapping/account";
import {Logger} from "../../../script_base/util/logger";
import {eCreationCategory} from "../../../script_share/@type/creationProfile";
import {te_customCreation} from "../../../script_share/aws/dynamodb/tableMapping/customCreation";
import {creationConfig, creationConfigCollectionsEncoded} from "../../gameConfig/creations/creationConfig";
import {iGameConfig} from "../../gameConfig/game/gameConfig.type";
import {playerStatus} from "../../gameConfig/player/playerStatus";
import {iPlayerStatus} from "../../gameConfig/player/playerStatus.type";
import {eBaseDebug} from "../../global/baseDebug";
import {baseScope} from "../../global/baseScope";
import {serverScope} from "../../global/serverScope";
import {epObjectGroupPathIndex, iObjectPathArr} from "../../moduleObjectGroup/objectPath.type";
import {eSchemaMap} from "../../moduleSchema/schema.enum";
import {iAiServerEntryClass, iawsWorkerComplete} from "../../workerAi/aiServer/aiServer.type";
import {eNetEvent} from "../networkEvent.enum";
import {iNetError} from "../networkEvent.type";
import {eNetworkPipe} from "../networkPipe.enum";
import {eOnlineStatus} from "../networkStatus.enum";
import {iServerClientNetworking, iServerClientUserData} from "./serverClient.type";
import {int} from "../../../script_base/util/number";
import {schemaId16} from "../../moduleSchema/schema16.util";
import {actionBindSchemaMap, actionSchemaMap} from "../../moduleSchemaAction/actionSchema.map";
import {eAiAction} from "../../moduleAction/action.enum";

interface iServerClientNetworkingProps {

}

/**
 * Define common networking API ABSTRACT methods
 * Take care pure game logic response
 */
export class ServerClientNetworking implements iServerClientNetworking {
    protected _logger = new Logger(eBaseDebug.serverClientNet);
    protected _ae: iAiServerEntryClass;
    protected _aw: iawsWorkerComplete;

    public userData: iServerClientUserData;

    get accUuid() {
        return this.userData.playerInfo[te_account.uuid];
    }

    get selfStatus() {
        return playerStatus[this.accUuid]
    }

    constructor(protected _props: iServerClientNetworkingProps) {
        this._ae = baseScope.ae as iAiServerEntryClass;
        this._aw = baseScope.aw as iawsWorkerComplete;
    }

    /**
     * coming in
     */
    public async onConnected(err?: iNetError): Promise<void> {
        this._logger.log("connected to server");

        try {
            // init selfStatus object for this player/accUuid
            if (playerStatus[this.accUuid] === undefined) {
                playerStatus[this.accUuid] = {
                    online: eOnlineStatus.online,
                    accUuid: this.accUuid,
                    clientSeqId: serverScope.net.clientSeqId,   // it will reuse existing clientSeqId -> existing player
                };
                serverScope.clientSeqIdUuidMap[this.selfStatus.clientSeqId] = this.accUuid;
            }
            const status = this.selfStatus;
            // update status
            status.online = eOnlineStatus.online;
            await this._aw.playerStatusUpdate(status);
        } catch (err) {
            console.log("could not get userData")
        }
    }

    public async onDisconnected(): Promise<void> {
        this._logger.log("disconnected from server", this.accUuid);
        const playerInfo = this.userData.playerInfo;
        if (!playerInfo) return;

        this.selfStatus.online = eOnlineStatus.offline;
        await this._aw.playerStatusUpdate(this.selfStatus);
    }

    protected async _onMsgCommon(eventCode: eNetEvent, data: any, senderId?) {
        this._logger.log(`on = ${eventCode}`, data);
        let needBreak = false;

        switch (eventCode) {
            case eNetEvent.worldCreate: {
                const d: iGameConfig = data as iGameConfig;

                // create new world or resume world
                const serverWorldState = serverScope.worldState;
                if (serverWorldState.active !== true) {
                    serverWorldState.active = true;
                    serverWorldState.gameConfig = d;
                    // first player who create the world will become the creator of this host server
                    serverWorldState.creatorToken = this.userData.creatorToken;
                    serverWorldState.creatorUuid = this.userData.playerInfo[te_account.uuid];

                    const world = serverScope.world;
                    const action = d.isExistWorld === true ? world.doResume.bind(world) : world.doCreate.bind(world);
                    await action(d).then(async () => {
                        serverWorldState.active = true;
                    }).catch(async (err) => {
                        console.error(err);
                        serverWorldState.active = false;
                        serverWorldState.gameConfig = undefined;
                        needBreak = true;
                        await this.emit(eNetEvent.serverError, typeof err === "string" ? err : "failed initiating world, please try again.")
                    })
                }
                if (needBreak) {
                    break;
                }

                await this.emit(eNetEvent.controllableCreatureIndex, creationConfig.controllableCreatureIndex);
                await this.emitRawEncoded(eSchemaMap.creationCollectionDefault, creationConfigCollectionsEncoded());

                // server scope or cache already have player actor
                this.selfStatus.clientSeqId && await this._aw.playerActorCacheLoad(this.selfStatus.clientSeqId);
                const existActorPath = await this._aw.playerActorPath(this.selfStatus.clientSeqId);
                if (existActorPath) {
                    await this._playerVerifyProcess(this.selfStatus, existActorPath);
                    break;
                }

                await this.emit(eventCode);
                break;
            }
            case eNetEvent.characterVerify: {
                const creatureUuid: string = data;
                const creationIndex = creationConfig.collections[eCreationCategory.creature].findIndex(tt => tt[te_customCreation.uuid] === creatureUuid);
                if (creationIndex === -1) {
                    await this.emit(eNetEvent.serverError, "The creation is not included in this server's creation collection");
                    break;
                }

                const controllable = creationConfig.controllableCreatureIndex.indexOf(creationIndex) >= 0;
                if (controllable) {
                    // create player actor in scope with given creation
                    await this._aw.playerActorCreate(this.selfStatus.clientSeqId, creationIndex)
                    const playerActorPath = await this._aw.playerActorPath(this.selfStatus.clientSeqId);
                    if(playerActorPath) {
                        await this._playerVerifyProcess(this.selfStatus, playerActorPath);
                    } else {
                        console.error(`failed create player ${this.selfStatus.clientSeqId} actor`)
                    }
                } else {
                    await this.emit(eNetEvent.serverError, "The creature is not controllable.");
                    break;
                }
            }
        }
    }

    protected async _playerVerifyProcess(status: iPlayerStatus, playerActorPath: iObjectPathArr) {
        console.log(`player ${this.selfStatus.clientSeqId} actor ready - path: ${playerActorPath}`)
        status.online = eOnlineStatus.playing;
        await this._aw.playerStatusUpdate(status);
        await this.emit(eNetEvent.characterVerify, {
            gp: playerActorPath[epObjectGroupPathIndex.gp],
            gi: playerActorPath[epObjectGroupPathIndex.gi],
        });
    }

    // common logic for all cs mode,
    protected async _onRawCommon(schema: eSchemaMap, rawObj?) {
        switch (schema) {
            case eSchemaMap.actionList: {
                this._aw.handleClientActions(this.selfStatus.clientSeqId, rawObj as Uint8Array[]);
                break;
            }
            default:
        }
    }

    /**
     * going out
     */
    protected _join(roomId) {

    }

    protected _leave() {

    }

    protected _close() {

    }

    // implement in child classes
    public async emit(eventCode, msg?, pipe = eNetworkPipe.tcp) {

    }

    // implement in child classes
    public async emitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
    }

    // implement in child classes
    public async emitRawEncoded(schema: eSchemaMap, encoded, pipe = eNetworkPipe.tcp) {
    }

    // to all in a room
    public async roomEmit(eventCode: eNetEvent, msg, pipe = eNetworkPipe.tcp) {
    }

    public async roomEmitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
    }

    // to all except sender
    public async broadcastEmit(eventCode: eNetEvent, msg, pipe = eNetworkPipe.tcp) {
    }

    public async broadcastEmitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
    }
}