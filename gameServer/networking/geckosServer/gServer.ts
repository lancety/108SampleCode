// server side connected client networking wrapper
import geckos from "../../../backup_module/@geckos.io.cjs/server/lib/index";
import ServerChannel from "../../../backup_module/@geckos.io.cjs/server/lib/geckos/channel";
import {GeckosServer} from "../../../backup_module/@geckos.io.cjs/server/lib/geckos/server";
import {Server as SocketServer, Socket} from "socket.io";

import {serverNetConfig} from "../../../gameBase/gameConfig/networking/serverNetConfig";
import {serverGeckosScope} from "../../../gameBase/global/serverGeckosScope";
import {serverGeckosScopeUtil} from "../../../gameBase/global/serverGeckosScope.util";
import {serverScope} from "../../../gameBase/global/serverScope";
import {eNetworkPipe} from "../../../gameBase/moduleNetwork/networkPipe.enum";
import {ServerNetworking} from "../../../gameBase/moduleNetwork/server/server";
import {iServerClientUserData} from "../../../gameBase/moduleNetwork/server/serverClient.type";
import {eSchemaMap} from "../../../gameBase/moduleSchema/schema.enum";
import {schemaMap} from "../../../gameBase/moduleSchema/schema.map";
import {iAiServerGeckos} from "../../../gameBase/workerAi/aiServerGeckos/aiServerGeckos.type";
import {iawsgWorker} from "../../../gameBase/workerAi/aiServerGeckos/awServerGeckos.type";
import {iPlayToken} from "../../../script_base/account/playToken.type";
import {te_account} from "../../../script_base/aws/dynamodb/tableMapping/account";
import {a2json} from "../../../script_base/util/json";
import {iFetchResponseWrapper} from "../../../script_base/util/request.type";
import {rsaDecryption} from "../../../script_base/utilNode/rsaToken";
import {iGSNetworking, iGSNetworkingAuth, iGSNetworkingProps} from "./gServer.type";
import {GSCNetworking} from "./gServerClient";
import {iGSCNetworking} from "./gServerClient.type";
import {baseScope} from "../../../gameBase/global/baseScope";
import {iServerWorldStatus} from "../../../gameBase/moduleCaching/gameCache.type";
import * as querystring from "querystring";
import {iceServers} from "./gServerIce";
import {addLatencyAndPackagesLoss} from "../../../gameBase/moduleNetwork/debug";
import {eNetEvent} from "../../../gameBase/moduleNetwork/networkEvent.enum";


// server side networking wrapper
export class GSNetworking<SC extends iGSCNetworking = iGSCNetworking> extends ServerNetworking<SC> implements iGSNetworking<SC> {
    private _tcpServer: SocketServer;
    private _udpServer: GeckosServer;
    protected _ae: iAiServerGeckos;
    protected _aw: iawsgWorker;

    constructor(protected _props: iGSNetworkingProps) {
        super(_props);
        this._processCachedClientCtrl();
    }

    /**
     *
     * @param {string} auth
     * @returns {boolean | iServerClientUserData}
     * @protected
     */
    protected _authCheck(auth: string): iServerClientUserData | undefined {
        try {
            const authObj: iGSNetworkingAuth = a2json(auth);
            if (this._playTokenDecodeKey === undefined || authObj?.playToken === undefined) return;

            const player: iPlayToken = rsaDecryption(authObj.playToken, this._playTokenDecodeKey);
            if (player === undefined || typeof player !== "object" || player[te_account.uuid] === undefined) return;

            const out: iServerClientUserData = {
                creatorToken: authObj.creatorToken,
                playToken: authObj.playToken,
                playerInfo: player,
            };
            return out;
        } catch (err) {
            console.error("authorization - not provided")
        }
    }

    protected _pipePublishCheck(accUuid: string) {
        // there is exist channels published, disconnect it
        const publishedPair = serverGeckosScope.clientChannels[accUuid];
        if (Array.isArray(publishedPair)) {
            publishedPair[0] && (publishedPair[0] as Socket).disconnect();
            publishedPair[1] && (publishedPair[1] as ServerChannel).close();
        }
        if (serverScope.clients[accUuid]) {
            serverScope.clients[accUuid].onDisconnected();
        }

        // there is new channels, check both connected
        const newPair = serverGeckosScope.playerChannelsNew[accUuid];
        if (!Array.isArray(newPair) || !newPair[0] || !newPair[1]) {
            return;
        }


        serverScope.clients[accUuid] = new GSCNetworking({
            tcpChannel: newPair[0],
            udpChannel: newPair[1],
        }) as unknown as SC;
        serverGeckosScope.clientChannels[accUuid] = serverGeckosScope.playerChannelsNew[accUuid];
        delete serverGeckosScope.playerChannelsNew[accUuid];
    }

    public serverStart = (greenlock: {httpServer, httpsServer, cert?}) => {
        const httpsServer = greenlock.httpsServer(greenlock.cert || null, async (req, res) => {
            res.writeHead(200, {
                "Access-Control-Allow-Origin": req.headers.origin || "*",
                "Access-Control-Allow-Headers": "authorization,Authorization,Cache-Control,Content-Type",
                "Content-Type": "application/json",
            });

            const responseJSON: iFetchResponseWrapper = {
                code: "200",
                message: "success",
                json: {},
            };

            if (req.url === "/worldList") {
                console.log("requesting worldList");
                // no matter current world is active or has saved world, gameConfig_base returns to client to connect server and load world detail includes full gameConfig object then.
                if (serverScope.worldState.active && serverScope.worldState.gameConfig) {
                    // if a server world already running, only return the world
                    (responseJSON.json as iServerWorldStatus).worldGameConfig = serverScope.worldState.gameConfig;
                } else {
                    // if server did not start any world yet, return saved worlds for client side selection
                    (responseJSON.json as iServerWorldStatus).worldList = await baseScope.aw.worldList();
                }
            } else if (req.url.indexOf("/?dbName") >= 0) {
                console.log("requesting worldConfig");
                const params = querystring.parse(req.url.replace(/^\/?\?/, ""));
                responseJSON.json = await (baseScope.aw as iawsgWorker).worldGameConfig(params.dbName as string);
            }
            res.end(JSON.stringify(responseJSON));
        });

        this._tcpServer = new SocketServer(httpsServer, {
            cors: {
                origin: (a, b) => {
                    b(undefined, a);
                },
                methods: ["GET", "POST"],
            },
        });
        this._tcpServer.use((socket, next) => {
            const authToken = socket.handshake.auth.token;
            const userData = this._authCheck(authToken);
            if (userData) {
                // 'socket.data' is for holding metadata
                socket.data = userData;
                next();
            } else {
                const err = new Error("TCP auth checking failed");
                next(err);
            }
        })

        this._tcpServer.on("connection", (socket) => {
            console.log("tcp connected");
            const {playerInfo} = socket.data as iServerClientUserData;
            const {uuid} = playerInfo;
            serverGeckosScope.playerChannelsNew[uuid] = serverGeckosScope.playerChannelsNew[uuid] || [];
            serverGeckosScope.playerChannelsNew[uuid][0] = socket;
            this._pipePublishCheck(uuid);
        })


        this._udpServer = geckos({
            iceServers: iceServers,
            authorization: async (auth: string, request) => {
                try {
                    // anything returned from here is holding in channel's 'userData' prop
                    const result = this._authCheck(auth) || false;
                    console.log(`udp request auth passed: ${JSON.stringify(result, null, 2)}`)
                    return result;
                } catch (err) {
                    console.error(err);
                }
            },
            cors: {
                // @ts-ignore
                origin: (req) => {
                    if (req.headers.origin === undefined) {
                        console.error('udp request no header origin')
                    }
                    return req.headers.origin;
                },
                allowAuthorization: true
            },
        });
        this._udpServer.addServer(httpsServer);
        this._udpServer.onConnection(channel => {
            console.log("udp connected");
            const {playerInfo} = channel.userData as iServerClientUserData;
            const {uuid} = playerInfo;
            serverGeckosScope.playerChannelsNew[uuid] = serverGeckosScope.playerChannelsNew[uuid] || [];
            serverGeckosScope.playerChannelsNew[uuid][1] = channel;
            this._pipePublishCheck(uuid);
        })
        httpsServer.listen(443, () => {
            console.log("Listening on ", httpsServer.address())
        });

        // Note:
        // You must ALSO listen on port 80 for ACME HTTP-01 Challenges
        // (the ACME and http->https middleware are loaded by glx.httpServer)
        const httpServer = greenlock.httpServer();

        httpServer.listen(80, "0.0.0.0", function() {
            console.info("Listening on ", httpServer.address());
        });
    }

    /**
     * keep posting clientCtrl cache to ai worker at ai worker's running sequence/fps
     * @protected
     */
    protected _processCachedClientCtrl() {
        setInterval(() => {
            this._aw.handleClientCtrlOnServerBatch(serverGeckosScopeUtil.exportClientCtrl());
            serverGeckosScopeUtil.cleanClientCtrl();
        }, 1000 / serverNetConfig.fps);
    }

    /**
     * going out
     */
    public async emit(eventCode, msg, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                this._tcpServer.emit(eventCode, msg);
                break;
            case eNetworkPipe.udp:
                this._udpServer.emit(eventCode, msg, undefined);
                break;
        }
    }

    public async emitRaw(schema: eSchemaMap, rawObj, pipe = eNetworkPipe.tcp) {
        switch (pipe) {
            case eNetworkPipe.tcp:
                // including eNetEvent.tcpRaw as Uint8Array
                addLatencyAndPackagesLoss(async () => {
                    this._tcpServer.emit(eNetEvent.tcpRaw, schemaMap[schema].encode(rawObj));
                }, false)
                break;
            case eNetworkPipe.udp:
                addLatencyAndPackagesLoss(async () => {
                    this._udpServer.raw.emit(schemaMap[schema].encode(rawObj));
                })
                break;
        }
    }

    public async roomEmit(eventCode, msg, roomId?, pipe = eNetworkPipe.tcp) {
        this._udpServer.room(roomId).emit(eventCode, msg);
    }

    public async roomEmitRaw(schema: eSchemaMap, rawObj, roomId?, pipe = eNetworkPipe.tcp) {
        this._udpServer.raw.room(roomId).emit(schemaMap[schema].encode(rawObj));
    }

}