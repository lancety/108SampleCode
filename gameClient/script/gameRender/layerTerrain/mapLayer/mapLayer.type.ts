import {enumUtil} from "../../../../../script_base/util/enum";

export enum epMapViewGroup {
    regions = "regions",
    contour = "contour",
    lines = "lines",
    icons = "icons",
    light = "light",
}
export const epMapViewGroupIndex = enumUtil.toMapKI<{[key in epMapViewGroup]: number}>(epMapViewGroup);
export const epMapViewGroupOrderedKey = enumUtil.enumKey(epMapViewGroup);