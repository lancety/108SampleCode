import {Component} from "../Component";
import {Logger} from "../../../../script_base/util/logger";
import {eAiDebug} from "../../../globalWorker/ai/aiDebug";
import {epSpineComponentAttrs, SpineComponentAttrsConfMap} from "./SpineComponent.attr.enum";
import {objectAttrUtil} from "../../../moduleObject/objectAttr.util";
import {eSchemaType} from "../../../moduleSchema/schema.enum";
import {eObjAttrRepMode} from "../../../moduleObject/objectAttr.enum";
import {iObjectAttrOpts} from "../../../moduleObject/objectAttr.type";


export class SpineComponent extends Component {
    protected _logger = new Logger(eAiDebug.spineComponent);

    protected _updateInitAttrs(ObjClass) {
        const originalFn = ObjClass.initAttrs;
        ObjClass.initAttrs = function(actor, opts, attrs) {
            originalFn(actor, opts, attrs);

            actor.attrs[epSpineComponentAttrs.creationCat] = objectAttrUtil.attrInit(SpineComponentAttrsConfMap[epSpineComponentAttrs.creationCat], {
                bufferType: eSchemaType.int8,
                bRender: true,
                bReplicateMode: eObjAttrRepMode.tcp,
            } as iObjectAttrOpts, actor, attrs[epSpineComponentAttrs.creationCat], -1);

            actor.attrs[epSpineComponentAttrs.creationId] = objectAttrUtil.attrInit(SpineComponentAttrsConfMap[epSpineComponentAttrs.creationId], {
                bufferType: eSchemaType.int16,
                bRender: true,
                bReplicateMode: eObjAttrRepMode.tcp,
            } as iObjectAttrOpts, actor, attrs[epSpineComponentAttrs.creationId], -1);
        }
    }
}