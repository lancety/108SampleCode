import {epSpineComponentAttrs} from "./SpineComponent.attr.enum";
import {iObjectAttrNum} from "../../../moduleObject/objectAttr.type";


export interface iSpineComponentAttrs {
    [epSpineComponentAttrs.creationCat]?: iObjectAttrNum,   // eCreationCategory,
    [epSpineComponentAttrs.creationId]?: iObjectAttrNum,
}