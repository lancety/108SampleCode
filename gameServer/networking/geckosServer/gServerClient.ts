import ServerChannel from "../../../backup_module/@geckos.io.cjs/server/lib/geckos/channel";
import {Socket as ClientSocket} from "socket.io";

import {serverGeckosScope} from "../../../gameBase/global/serverGeckosScope";
import {serverGeckosScopeUtil} from "../../../gameBase/global/serverGeckosScope.util";
import {serverScope} from "../../../gameBase/global/serverScope";
import {addLatencyAndPackagesLoss} from "../../../gameBase/moduleNetwork/debug";
import {eNetEvent} from "../../../gameBase/moduleNetwork/networkEvent.enum";
import {networkEventCodeList} from "../../../gameBase/moduleNetwork/networkEvent.type";
import {eNetworkPipe} from "../../../gameBase/moduleNetwork/networkPipe.enum";
import {ServerClientNetworking} from "../../../gameBase/moduleNetwork/server/serverClient";
import {eSchemaMap} from "../../../gameBase/moduleSchema/schema.enum";
import {schemaId8} from "../../../gameBase/moduleSchema/schema8.util";
import {schemaMap} from "../../../gameBase/moduleSchema/schema.map";
import {iAiServerGeckos} from "../../../gameBase/workerAi/aiServerGeckos/aiServerGeckos.type";
import {iawsgWorker} from "../../../gameBase/workerAi/aiServerGeckos/awServerGeckos.type";
import {iGSCNetworking} from "./gServerClient.type";
import {iGameConfig} from "../../../gameBase/gameConfig/game/gameConfig.type";
import {baseScope} from "../../../gameBase/global/baseScope";
import {setWorldCacheUtil} from "../../../gameBase/moduleCaching/worldCache.util";
import {worldCacheNodeUtil} from "../../../gameBase/moduleCaching/worldCacheNode.util";
import {WorldCacheNode} from "../../../gameBase/moduleCaching/worldCacheNode";
import {inputControlUtil} from "../../../gameBase/moduleSchema/control/inputControlUtil";

interface iGSCNetworkingProps {
    tcpChannel: ClientSocket,
    udpChannel: ServerChannel,
}

/**
 * take care networking library API call
 */
export class GSCNetworking extends ServerClientNetworking implements iGSCNetworking {
    protected _ae: iAiServerGeckos;
    protected _aw: iawsgWorker;

    protected _tcpChannel: ClientSocket;
    protected _udpChannel: ServerChannel;

    constructor(protected _props: iGSCNetworkingProps) {
        super(_props);

        this._tcpChannel = _props.tcpChannel;
        this._udpChannel = _props.udpChannel;
        this.userData = this._udpChannel.userData;  // todo - prefer to use data from _tcpChannel
        this._logger.log("player connected", this.accUuid);

        this.onConnected()
    }

    public async onConnected(err?) {
        await super.onConnected(err);

        console.log("tcp and udp both connected");

        this._tcpChannel.on("disconnect", () => {
            this.onDisconnected();
        });
        this._udpChannel.onDisconnect(reason => {

        });

        networkEventCodeList.forEach(eventCodeStr => {
            [this._tcpChannel, this._udpChannel].forEach(channel => {
                channel.on(eventCodeStr, async (data, senderId?) => {
                    const eventCode: eNetEvent = eventCodeStr as eNetEvent;

                    console.log(`received net event ${eNetEvent[eventCode]}`);

                    switch (eventCode) {
                        // all rest events do not need geckos to process data, directly call super
                        case eNetEvent.worldCreate: {
                            const d: iGameConfig = data as iGameConfig;

                            // create new world or resume world
                            const serverWorldState = serverScope.worldState;
                            if (serverWorldState.active !== true) {
                                setWorldCacheUtil(worldCacheNodeUtil);
                                await baseScope.aw.syncGameConfig(d);
                                baseScope.worldCache = new WorldCacheNode(d);
                            }
                            await this._onMsgCommon(eventCode, data, senderId);
                            break;
                        }
                        case eNetEvent.tcpRaw:
                            break;   // tcpRaw not handled at here, find by 'tcpRaw' to see its handler
                        default: {
                            await this._onMsgCommon(eventCode, data, senderId);
                        }
                    }
                });
            })
        });

        this._tcpChannel.on(eNetEvent.tcpRaw, async (encoded: Uint8Array) => {
            const schemaCode = schemaId8(encoded);
            const data = schemaMap[schemaCode].decode(encoded);

            switch (schemaCode) {
                default:
                    await this._onRawCommon(schemaCode, data);
            }
        })

        this._udpChannel.onRaw(async (encoded: Uint8Array) => {
            const schemaCode = schemaId8(encoded);
            if (schemaCode) {
                const data = schemaMap[schemaCode].decode(encoded);
                switch (schemaCode) {
                    case eSchemaMap.inputControl:
                        serverGeckosScopeUtil.cacheClientCtrl(this.selfStatus.clientSeqId, inputControlUtil.typed2cache(data));
                        break;
                    default:
                        await this._onRawCommon(schemaCode, data);
                }
            } else {
                console.error("could not find schema for given raw buffer");
            }
        });
    }

    public async onDisconnected(): Promise<void> {
        await super.onDisconnected();

        delete serverScope.clients[this.accUuid];
        delete serverGeckosScope.clientChannels[this.accUuid];
    }

    /**
     * going out
     */
    protected _join(roomId) {
        super._join(roomId);
        this._udpChannel.join(roomId);
    }

    protected _leave() {
        super._leave();
        this._udpChannel.leave();
    }

    protected _close() {
        super._close();
        this._udpChannel.close();
    }

    public async emit(eventCode, msg, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                addLatencyAndPackagesLoss(async () => {
                    this._tcpChannel.emit(eventCode, msg);
                }, false)
                break;
            case eNetworkPipe.udp:
                addLatencyAndPackagesLoss(async () => {
                    this._udpChannel.emit(eventCode, msg, undefined);
                })
                break;
        }
    }

    public async emitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                addLatencyAndPackagesLoss(async () => {
                    this._tcpChannel.emit(eNetEvent.tcpRaw, schemaMap[schema].encode(rawObj));
                }, false)
                break;
            case eNetworkPipe.udp:
                addLatencyAndPackagesLoss(async () => {
                    this._udpChannel.raw.emit(schemaMap[schema].encode(rawObj));
                })
                break;
        }
    }

    public async emitRawEncoded(schema: eSchemaMap, encoded, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                addLatencyAndPackagesLoss(async () => {
                    this._tcpChannel.emit(eNetEvent.tcpRaw, encoded);
                }, false)
                break;
            case eNetworkPipe.udp:
                addLatencyAndPackagesLoss(async () => {
                    this._udpChannel.raw.emit(encoded);
                })
                break;
        }
    }

    public async roomEmit(eventCode, msg, pipe = eNetworkPipe.tcp) {
        addLatencyAndPackagesLoss(async () => {
            this._udpChannel.room.emit(eventCode, msg, undefined);
        })
    }

    public async roomEmitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
        addLatencyAndPackagesLoss(async () => {
            rawObj = rawObj.constructor === Uint8Array ? rawObj : schemaMap[schema].encode(rawObj);
            await this._udpChannel.raw.room.emit(rawObj);
        })
    }

    public async broadcastEmit(eventCode, msg, pipe = eNetworkPipe.tcp) {
        addLatencyAndPackagesLoss(async () => {
            this._udpChannel.broadcast.emit(eventCode, msg, undefined);
        })
    }

    public async broadcastEmitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
        addLatencyAndPackagesLoss(async () => {
            rawObj = rawObj.constructor === Uint8Array ? rawObj : schemaMap[schema].encode(rawObj);
            await this._udpChannel.raw.broadcast.emit(rawObj);
        })
    }
}