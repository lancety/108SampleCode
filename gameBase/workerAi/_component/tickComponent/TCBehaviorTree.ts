import {Logger} from "../../../../script_base/util/logger";
import {btNodeCore} from "../../../../script_module/behaviorEditor/src/behaviorTree";
import BehaviorTree from "../../../../script_module/behaviorEditor/src/behaviorTree/core/behaviorTree";
import Blackboard from "../../../../script_module/behaviorEditor/src/behaviorTree/core/blackboard";
import {eAiDebug} from "../../../globalWorker/ai/aiDebug";
import {btNodeBase} from "../../../moduleBT/btNodeBase";
import {eObjectRole} from "../../../moduleObject/object.role";
import {eObjectGroup} from "../../../moduleObjectGroup/objectGroup.enum";
import {AActor} from "../../_class/actorClass/AActor";
import {iCBehaviorProps} from "./TCBehaviorTree.type";
import {TickComponent} from "./TickComponent";
import {iAPawn} from "../../_class/actorClass/APawn.type";


export class TCBehaviorTree<A extends iAPawn> extends TickComponent<A> {
    protected _logger = new Logger(eAiDebug.btComponent);
    protected _bt: BehaviorTree;

    /**
     * call once and bind to Actor class instance
     */
    constructor(protected _props: iCBehaviorProps) {
        super(_props);
        this._initBt(_props);
    }

    /**
     * this static fn is used for blocking construction of this class if props is not valid
     * @param props
     */
    static isPropsValid(props: iCBehaviorProps): boolean {
        if (!props.gp) {
            console.error(`gp undefined`);
            return false;
        }
        if (!props.btTree) {
            console.error(`${eObjectGroup[props.gp]} bt tree undefined`);
            return false;
        }
        if (Object.values(props.btTree).length === 0) {
            console.error(`${eObjectGroup[props.gp]} empty bt tree`);
            return false;
        }
        return super.isPropsValid(props);
    }

    /**
     * called many times for each iAActor<A> object which is belong to an Actor class
     * @param Actor
     * @param actor
     */
    onTick(Actor: AActor, actor: A): void {
        // for now only tick ai behavior logic on server side. Exceptions:
        // - client side NPC (same logic run on both client and server, client making action, server aslo do correction)
        // - todo - for client control NPC, make the NPC actor role to be authority
        if (actor.opts.role !== eObjectRole.authority) return;

        if (this._bt === undefined) return;

        if (actor.state.tickBt !== true) return;
        // todo - dynamically adjust tickFrame ???
        if (actor.state.tickBtAwaitCount === this._props.tickFrame) {
            actor.state.tickBtAwaitCount = 0;
            this._beforeTick(actor);
            this._tick(actor);
            this._afterTick(actor);
        } else {
            actor.state.tickBtAwaitCount++;
        }
    }

    toString() {
        return "CBehaviorTree";
    }

    protected _beforeTick(actor: A): void {
        if (actor.blackboard === undefined) {
            actor.blackboard = new Blackboard();
        }
    }

    protected _tick(actor: A): void {
        this._bt.tick(actor, actor.blackboard);
    }

    protected _afterTick(actor: A): void {
    }


    protected _initBt(props: iCBehaviorProps) {
        if (btNodeBase === undefined) {
            return;
        }

        this._bt = new BehaviorTree();
        this._bt.load(
            props.btTree,
            Object.assign({}, btNodeCore, ...Object.values(btNodeBase))
        )
        this._logger.active && this._logger.log(`inited ${this.toString()} of ${eObjectGroup[props.gp]}`);
    }
}