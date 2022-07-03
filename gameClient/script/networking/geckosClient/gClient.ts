import geckos from '@geckos.io/client'
import {ClientChannel} from "@geckos.io/client/lib/geckos/channel";
import {io, Socket as SocketClient} from "socket.io-client"
import {Transfer} from "threads";

import {creationConfig} from "../../../../gameBase/gameConfig/creations/creationConfig";
import {gameConfig} from "../../../../gameBase/gameConfig/game/gameConfig";
import {ClientNetworking} from "../../../../gameBase/moduleNetwork/client/client";
import {iClientNetworkingProps} from "../../../../gameBase/moduleNetwork/client/client.type";
import {addLatencyAndPackagesLoss} from "../../../../gameBase/moduleNetwork/debug";
import {eNetEvent} from "../../../../gameBase/moduleNetwork/networkEvent.enum";
import {networkEventCodeList} from "../../../../gameBase/moduleNetwork/networkEvent.type";
import {eNetworkPipe} from "../../../../gameBase/moduleNetwork/networkPipe.enum";
import {eSchemaMap} from "../../../../gameBase/moduleSchema/schema.enum";
import {schemaId8} from "../../../../gameBase/moduleSchema/schema8.util";
import {schemaMap} from "../../../../gameBase/moduleSchema/schema.map";
import {iAiClientGeckos} from "../../../../gameBase/workerAi/aiClientGeckos/aiClientGeckos.type";
import {iawcgWorker} from "../../../../gameBase/workerAi/aiClientGeckos/awClientGeckos.type";
import {iWorldClientGeckos} from "../../../../gameBase/world/worldClient/worldClientGeckos.type";
import {iGSNetworkingAuth} from "../../../../gameServer/networking/geckosServer/gServer.type";
import {accountCache} from "../../../../script_base/account/accountCache";
import {eAccountResponse} from "../../../../script_base/aws/gateway/accountResponse.type";
import {json2a} from "../../../../script_base/util/json";
import {int} from "../../../../script_base/util/number";
import {iGCNetworking} from "./gClient.type";
import {iTcpSnapshot} from "../../../../gameBase/moduleActor/ATcpSnapshot.type";
import {awcgRepLog} from "../../../../gameBase/globalWorker/ai/aiDebug";
import {epObjectKey} from "../../../../gameBase/moduleObjectGroup/objectKey.type";

// client side networking wrapper
export class GCNetworking extends ClientNetworking implements iGCNetworking {
    protected _world: iWorldClientGeckos;
    protected _ae: iAiClientGeckos;
    protected _aw: iawcgWorker;

    private _tcpChannel: SocketClient;
    private _udpChannel: ClientChannel;

    constructor(props: iClientNetworkingProps) {
        super(props);
        this._connect();
    }

    private _connect() {
        const {url, port} = gameConfig.serverProfile;
        this._tcpChannel = io(
            `${url}:${port}`, {
                auth: {
                    token: json2a({
                        creatorToken: accountCache[eAccountResponse.userToken],
                        playToken: accountCache[eAccountResponse.playToken],
                    })
                },
                reconnection: false,

            }
        );
        this._tcpChannel.on("connect", () => {
            console.log("tcp connected", this._tcpChannel.id);
        })
        this._tcpChannel.on("connect_error", (err) => {
            console.error(err.message);
        })

        const geckosConnectConfig = Object.assign(
            {},
            gameConfig.serverProfile,
            {
                authorization: json2a({
                    creatorToken: accountCache[eAccountResponse.userToken],
                    playToken: accountCache[eAccountResponse.playToken],
                } as iGSNetworkingAuth),
            }
        )
        this._udpChannel = geckos(geckosConnectConfig);
        this._udpChannel.onConnect(err => {
            if (err) {
                console.error(err);
            } else {
                console.log("udp connected")
                this._onConnect(err);
            }
        });
    }

    protected _onConnect(err) {
        super._onConnect(err);

        this._udpChannel.onDisconnect(reason => {
            super._onDisconnect(reason);
        });

        networkEventCodeList.forEach(async eventCode => {
            [this._tcpChannel, this._udpChannel].forEach(channel => {
                channel.on(eventCode as unknown as string, async (data) => {
                    switch (eventCode) {
                        case eNetEvent.characterVerify: {
                            await this._onMsgCommon(eventCode, data);
                            break;
                        }
                        case eNetEvent.controllableCreatureIndex: {
                            await this._onMsgCommon(eventCode, data);
                            creationConfig.controllableCreatureIndex = data as int[];
                            break;
                        }
                        default:
                            await this._onMsgCommon(eventCode, data);
                    }
                });
            })
        });

        // tcp emit includes both "normal emit" and "raw emit", raw will have id indicate what data it is
        this._tcpChannel.on(eNetEvent.tcpRaw, async (rawBuffer: Uint8Array) => {
            const id = schemaId8(rawBuffer);

            switch (id) {
                case eSchemaMap.creationCollectionDefault: {
                    creationConfig.collections = schemaMap[id].decode(rawBuffer);
                    this._aw.regDefaultCollection(Transfer(rawBuffer) as unknown as Uint8Array);
                    break;
                }
                case eSchemaMap.tcpSnapshot: {
                    this._aw.insertTcpSnapshot(rawBuffer);

                    if (awcgRepLog.active) {
                        const data = schemaMap[id].decode(rawBuffer);
                        const {newRepKeys, removeRepPaths} = data as iTcpSnapshot;
                        if ((newRepKeys.length > 0 || removeRepPaths.length > 0)) {
                            awcgRepLog.log(
                                "received",
                                newRepKeys.flatMap(keys => [keys[epObjectKey.gb], keys[epObjectKey.gp], keys[epObjectKey.gi]]).join(" "),
                                removeRepPaths.join(" "));
                        }
                    }
                    break;
                }
                default:
                    await this._onRawCommon(id);
            }
        });

        // udp onRaw only receiving raw data, type of raw data is indicated from data
        this._udpChannel.onRaw(async (rawBuffer: ArrayBuffer) => {
            const id = schemaId8(rawBuffer);

            switch (id) {
                case eSchemaMap.udpSnapshot: {
                    this._aw.insertUdpSnapshot(rawBuffer);

                    break;
                }
                default:
                    await this._onRawCommon(id);
            }
        });
    }

    /**
     * going out
     */
    public async emit(eventCode: eNetEvent, msg?, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                addLatencyAndPackagesLoss(async () => {
                    this._tcpChannel.emit(eventCode, msg);
                }, false)
                break;
            case eNetworkPipe.udp:
                addLatencyAndPackagesLoss(async () => {
                    this._udpChannel.emit(eventCode, msg);
                })
                break;
        }
    }

    /**
     * for C/S mode, rawObj need to be encoded, remote will decode then call onRawCommon
     * @param schema
     * @param rawObj
     * @param pipe
     */
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

    /**
     * for C/S mode, encoded directly sent to remote, remote will decode then call onRawCommon
     * @param schema
     * @param encoded
     * @param pipe
     */
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

    protected _close() {
        super._close();
        this._udpChannel.close();
    }
}