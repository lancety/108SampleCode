import {iServerNetworking, iServerNetworkingProps} from "../../../gameBase/moduleNetwork/server/server.type";
import {iGSCNetworking} from "./gServerClient.type";

export interface iGSNetworkingProps extends iServerNetworkingProps {

}

export interface iGSNetworkingAuth {
    creatorToken?: string,     // player who host the game will provide userToken
    playToken: string,      // decode this in hosted server
}

export interface iGSNetworking<SC = iGSCNetworking> extends iServerNetworking<SC> {
    serverStart(greenlock: {httpServer, httpsServer, cert?}):void,
}