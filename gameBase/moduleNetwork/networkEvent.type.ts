import {enumUtil} from "../../script_base/util/enum";
import {int} from "../../script_base/util/number";
import {tt_customCreation} from "../../script_share/aws/dynamodb/tableMapping/customCreation";
import {iGameConfig} from "../gameConfig/game/gameConfig.type";
import {eNetEvent} from "./networkEvent.enum";

export const networkEventCodeList: eNetEvent[] = Object.values(eNetEvent);

export interface iNetEventClientEmit {
    [eNetEvent.worldCreate]: iGameConfig,
    [eNetEvent.characterVerify]: tt_customCreation, // creation uuid
}

export interface iNetEventServerEmit {
    [eNetEvent.worldCreate]: undefined,
    [eNetEvent.characterVerify]: {gp: int, gi: int}, // player body gpgi

    [eNetEvent.serverError]: eNetEvent
}

export interface iNetError {
    message: string,
    name: string,
    status: int,
    statusText: string,
}