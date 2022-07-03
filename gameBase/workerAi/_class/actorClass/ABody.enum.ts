import {enumUtil} from "../../../../script_base/util/enum";

/**
 * long lasting status
 */
export const epABodyStatus = {
    idle: "idle",
    battle: "battle",
    destroyed: "destroyed",

    // character only
    cRunaway: "cRunaway",
    cBattle2idle: "cBattle2idle",
}
export type epABodyStatus = (typeof epABodyStatus)[keyof typeof epABodyStatus];

export const epABodyStatusNKArr = enumUtil.toArrayNK(epABodyStatus);
export const epABodyStatusIndex = enumUtil.toMapKI<{ [key in epABodyStatus]: number }>(epABodyStatus);
export const epABodyStatusOrderedKey = enumUtil.enumKey(epABodyStatus);

export const attrStatusIs = {
    battle: (status: number)=> {
        return epABodyStatusOrderedKey[status] === epABodyStatus.battle || epABodyStatusOrderedKey[status] === epABodyStatus.cRunaway || epABodyStatusOrderedKey[status] === epABodyStatus.cBattle2idle;
    }
}