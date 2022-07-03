import {iComponentProps} from "./Component.type";
import {ObjectBase} from "../../moduleObject/object";

export class Component {
    constructor(protected _props: iComponentProps) {
        this._updateInitAttrs(_props.parentObjClass);
    }

    static isPropsValid(props: iComponentProps): boolean {
        return true;
    }

    toString() {
        return "Component";
    }

    protected _updateInitAttrs(ObjClass: ObjectBase) {
        // if child need init any attrs
    }
}