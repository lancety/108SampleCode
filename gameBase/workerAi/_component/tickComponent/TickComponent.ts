import {Component} from "../Component";
import {iTickComponentProps} from "./TickComponent.type";
import {iAThing} from "../../_class/actorClass/AThing.type";

/**
 * each component instance owned by one AActor or subclass; OR as singleton class instance
 */
export class TickComponent<A extends iAThing = iAThing> extends Component {
    constructor(protected _props: iTickComponentProps) {
        super(_props);
    }

    static isPropsValid(props: iTickComponentProps): boolean {
        if (props.parentObjClass === undefined) {
            return false;
        }
        return super.isPropsValid(props);
    }

    public onTick(Actor, actor: A): void {

    }

    public toString() {
        return "ActorComponent";
    }
}