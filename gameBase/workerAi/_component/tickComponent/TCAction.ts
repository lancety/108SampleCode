import {Logger} from "../../../../script_base/util/logger";
import {eBtTickStatus} from "../../../../script_module/behaviorEditor/src/behaviorTree/bt.enum";
import {eAiDebug} from "../../../globalWorker/ai/aiDebug";
import {aiScope} from "../../../globalWorker/ai/aiScope";
import {eAbsAction, eActCore, eAiAction} from "../../../moduleAction/action.enum";
import {eAiActionMode, eAiActionTrigger} from "../../../moduleAction/aiActionConf.enum";
import {eObjectRole} from "../../../moduleObject/object.role";
import {ObjectAttr} from "../../../moduleObject/objectAttr";
import {iAActor} from "../../_class/actorClass/AActor.type";
import {epABodyAttrs} from "../../_class/actorClass/ABody.attr.enum";
import {iAPawn} from "../../_class/actorClass/APawn.type";
import {iACActionHandleOutput, iACActionProps} from "./TCAction.type";
import {TickComponent} from "./TickComponent";
import {aiActions} from "../../../moduleAction/aiActionConf";
import {aiActionEventMap} from "../../../moduleAction/event/aiActionEvent";
import {iAThing} from "../../_class/actorClass/AThing.type";


export class TCAction<T extends iAActor = iAActor> extends TickComponent<T> {
    public actLogger = new Logger(eAiDebug.actionComponent);

    constructor(protected _props: iACActionProps) {
        super(_props);
    }

    static isPropsValid(props: iACActionProps): boolean {
        return super.isPropsValid(props);
    }

    onTick(Actor, actor: iAActor): void {
        this._cleanExpired(actor);  // if any lock time expired, clean the action (period action)
        this._onTickEventTrigger(actor);
        this._onTickCooldownEnd(actor);
    }

    protected _onTickEventTrigger(actor: iAActor) {
        actor.state.actEventQueue.forEach((events, action) => {
            for (let i = events.length - 1; i >= 0; i--) {
                if (aiScope.runner.tickId === events[i][0]) {
                    const eventCode = events[i][1];
                    this.actLogger.log('TickEventTrigger: action', eAiAction[action], "event", eventCode);

                    if (aiActionEventMap[eventCode]) {
                        this.actLogger.log('TickEventTrigger: event action', eAiAction[aiActionEventMap[eventCode]]);
                        // since events are part of action, both client and server will trigger events,
                        // and events don't need to be synced, so its mapped action always trigger as local
                        this.handleAiAction(actor, aiActionEventMap[eventCode], eAiActionTrigger.local);
                    }
                    events.pop();
                } else {
                    break;
                }
            }
            if (events.length === 0) {
                actor.state.actEventQueue.delete(action);
            }
        })
    }

    protected _onTickCooldownEnd(actor: iAActor) {
        actor.state.actCoolDownEnd.forEach((tickId, actCode) => {
            if (aiScope.runner.tickId >= actor.state.actCoolDownEnd.get(actCode)) {
                this.actLogger.log('TickCooldownEnd: action', eAiAction[actCode]);
                actor.state.actCoolDownEnd.delete(actCode);
            }
        })
    }

    toString() {
        return "CAction";
    }

    private _logHead(actor: iAThing) {
        return [aiScope.runner.tickId, actor.path[1], actor.path[2]];
    }

    /**
     * main action such as attack - need to be more specific attack based on actor class type
     * @param actor
     * @param actMain
     */
    public convertMainToSubAction(actor: iAActor, actMain: eAbsAction): eAiAction {
        return;
    }

    handleAiActionForce(actor: iAActor, actCode: eAiAction, actTrigger: eAiActionTrigger, ...data): eBtTickStatus {
        const animIndexs = aiActions[actCode].animIndex;
        // remove anim block
        animIndexs.forEach((animIndex, index) => {
            animIndex > 0 && (actor.state.animTrackLock[index] = false);
        })
        // remove action block
        actor.state.actCoolDownEnd.delete(actCode);
        return this.handleAiAction(actor, actCode, actTrigger, ...data);
    }

    /**
     * AActor instance action only can be those with eSubActionMode.toggle or eSubActionMode.trigger
     * todo - force interrupt an exist action, such as taken damage
     * @param actor
     * @param aiAction
     * @param actTrigger
     * @param data  extra data of anything
     */
    handleAiAction(actor: iAActor, aiAction: eAiAction, actTrigger: eAiActionTrigger, ...data): eBtTickStatus {
        if (this._isActionLocking(actor, aiAction)) {
            // this.actLogger.active && this.actLogger.log(...this._logHead(actor), `${aiAction} failed trigger, _isActionLocking`);
            return eBtTickStatus.FAILURE;
        }

        if (this._isAnimLocking(actor, aiAction)) {
            // this.actLogger.active && this.actLogger.log(...this._logHead(actor), `${aiAction} failed trigger, _isAnimLocking`);
            return eBtTickStatus.FAILURE;
        }

        // call the ACAction custom handler
        let result;
        if (typeof this[aiAction] === "function") {
            result = this[aiAction](actor, ...data) as iACActionHandleOutput;
            this.actLogger.active && this.actLogger.log(...this._logHead(actor), 'calling action fn', eAiAction[aiAction], Date.now(), actor.state)
        } else {
            // todo - action without handler function might still need to update animDuration from standard value
            result = eBtTickStatus.SUCCESS;
        }

        // maxAnimDuration is max duration of tracks which changed during current tickId
        let maxAnimDuration: number;

        if (result === eBtTickStatus.SUCCESS) {
            // if animDuration exist in aiActionConf, use it to filter duration of attr, otherwise is 0
            maxAnimDuration = aiActions[aiAction].animDuration ? Math.max(
                ...actor.attrs[epABodyAttrs.animDuration].value.filter((v, ind) => {
                    return aiActions[aiAction].animDuration[ind] > 0;
                })
            ) : 0;
            // normal case - action processed
            this._setActAnim(actor, aiAction);
            this._setActCooldown(actor, aiAction, maxAnimDuration);
            this._cacheAct(actor, aiAction, actTrigger);
        } else if (Array.isArray(result)) {
            maxAnimDuration = 0; // todo - duration might be something from array actions
            // special case - action result caused other action status. todo - no case for 1+ array item
            result.forEach(aiAction => {
                this._setActAnim(actor, aiAction);
                this._setActCooldown(actor, aiAction, 0);
                this._cacheAct(actor, aiAction, actTrigger);
            })
            result = eBtTickStatus.SUCCESS;
        }

        if (result === eBtTickStatus.SUCCESS && aiActions[aiAction].events) {
            this._attachEvents(actor, aiAction, maxAnimDuration);
        }
        return result as eBtTickStatus;
    }

    // cancel sub action which mode is toggle, e.g. couch / un couch, sprint / un sprint
    toggleOffAiAction(actor: iAActor, actSub: eAiAction, actMode: eAiActionTrigger): eBtTickStatus {
        this.actLogger.active && this.actLogger.log(...this._logHead(actor), 'toggleOffAiAction', eAiAction[actSub]);
        this._cacheAct(actor, -actSub, actMode); // negative action code to indicate removal
        this._unsetActAnim(actor, actSub);

        return eBtTickStatus.SUCCESS;
    }

    /**
     * todo - terminate action including:
     *  - reset animation
     *  - remove action event queue
     * @param actor
     * @param actSub
     * @param actMode
     */
    terminateAiAction(actor: iAActor, actSub: eAiAction, actMode: eAiActionTrigger): eBtTickStatus {
        return eBtTickStatus.SUCCESS;
    }

    protected _isActionLocking(actor: iAActor, actionCode: eAiAction) {
        return aiScope.runner.tickId <= actor.state.actCoolDownEnd.get(actionCode);
    }

    protected _isAnimLocking(actor: iAActor, actionCode: eAiAction) {
        if (aiActions[actionCode].mode === eAiActionMode.event) return false;

        // when destroyed action happen, always make everything unlock
        if (actionCode === eActCore.destroyed) return false;

        const newAnimLocked: boolean[] = aiActions[actionCode].animLock;
        const locked = newAnimLocked.findIndex((animTrackLock, index) => {
            return animTrackLock && actor.state.animTrackLock[index];
        }) >= 0;
        // this.actLogger.active && this.actLogger.log(...this._logHead(actor), `locked? ${locked} new anim ${newAnims.join(",")} new lock ${newAnimLocks.join(",")} curr ${actor.state.actLockCode.join(",")}`)
        return locked;
    }


    /**
     * this is called only when no anim here blocked by existing animation running
     * @param actor
     * @param actCode
     * @protected
     */
    protected _setActAnim(actor: iAActor, actCode: eAiAction) {
        if (aiActions[actCode].mode === eAiActionMode.event) return;

        const newAnimIndex = aiActions[actCode].animIndex;
        const newAnimLocked = aiActions[actCode].animLock;

        const currentAnimDuration = actor.attrs[epABodyAttrs.animDuration].value;  // new value just set

        let newTrackLocked,
            animUpdated = false;

        newAnimIndex && newAnimIndex.forEach((animIndex, index) => {    // action anim tracks refer to spine anim track
            if (actor.state.animTrackLock[index]) {
                // if current track locked by other action, dont update its animation attr or state
                return;
            }

            newTrackLocked = actor.state.animTrackLock[index] = newAnimLocked[index];
            if (newTrackLocked) {
                if (animIndex > 0) {
                    // update this anim attrs, action state and lock
                    animUpdated = true;
                    actor.attrs[epABodyAttrs.anim].value[index] = animIndex;
                    actor.attrs[epABodyAttrs.animTickId].value[index] = aiScope.runner.tickId;
                    // duration is calculated when calling action handler before _setActAnim
                } else if (animIndex < 0) {
                    // remove exist anim attrs, update action state and lock
                    animUpdated = true;
                    actor.attrs[epABodyAttrs.anim].value[index] = 0;
                    actor.attrs[epABodyAttrs.animTickId].value[index] = aiScope.runner.tickId;
                    actor.attrs[epABodyAttrs.animDuration].value[index] = 0;
                }
            } else {
                if (animIndex > 0) {
                    // not locked, only update anim attrs
                    animUpdated = true;
                    actor.attrs[epABodyAttrs.anim].value[index] = animIndex;
                    actor.attrs[epABodyAttrs.animTickId].value[index] = aiScope.runner.tickId;
                }
            }


            if (animIndex > 0) {
                actor.state.animTrackAction[index] = actCode;
                actor.state.animTrackEnd[index] = currentAnimDuration[index] ? currentAnimDuration[index] * 1000 + Date.now() : 0;
            }
        })

        if (animUpdated) {
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.anim]);
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.animTickId]);
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.animDuration]);
            this._logAttrState(actor, actCode, true);
        }
    }

    private _logAttrState(actor: iAActor, actCode: eAiAction, set?: boolean) {
        this.actLogger.active && this.actLogger.log(
            ...this._logHead(actor),
            set ? "setAnim: " : "unsetAnim",
            'act', eAiAction[actCode],
            'animIndex', actor.attrs[epABodyAttrs.anim].value.join(","),
            'animTickId', actor.attrs[epABodyAttrs.animTickId].value.join(","),
            "actCode", actor.state.animTrackAction.join(","),
            'animEnd', actor.state.animTrackEnd.join(','),
            'animLock', actor.state.animTrackLock.join(','),
            'time', Date.now()
        )
    }

    /**
     * in anim attr value, positive anim code means set, negative means unset animation
     * @param actor
     * @param actCode
     * @protected
     */
    protected _unsetActAnim(actor: iAActor, actCode: eAiAction) {
        if (actCode === eActCore.destroyed) {
            return;
        }

        if (aiActions[actCode].mode === eAiActionMode.event) return;

        const animIndexConf = aiActions[actCode].animIndex;
        const animLockConf = aiActions[actCode].animLock;

        let animUpdated = false;
        animIndexConf && animIndexConf.forEach((animIndex, index) => {
            // if current track animIndex is not same as what defined in aiActions config, ignore
            if (animIndex > 0 && animIndex === actor.attrs[epABodyAttrs.anim].value[index]) {
                animUpdated = true;
                actor.attrs[epABodyAttrs.anim].value[index] = 0;
                actor.attrs[epABodyAttrs.animTickId].value[index] = aiScope.runner.tickId;  // render pick the change
                actor.attrs[epABodyAttrs.animDuration].value[index] = 0;

                actor.state.animTrackAction[index] = 0;
                actor.state.animTrackEnd[index] = 0;
            }

            animLockConf[index] && (actor.state.animTrackLock[index] = false);
        })

        if (animUpdated) {
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.anim]);
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.animTickId]);
            ObjectAttr.setTickId(actor.attrs[epABodyAttrs.animDuration]);
            this._logAttrState(actor, actCode);
        }
    }

    private _setActCooldown(actor: iAActor, actCode: eAiAction, maxAnimDuration: number) {
        if (!(aiActions[actCode].actCooldown > 0)) return;

        const currentAnimCooldown = actor.attrs[epABodyAttrs.actCooldown].value;  // new value just set
        const lockCycle = (maxAnimDuration + currentAnimCooldown) * 1000;
        this.actLogger.active && this.actLogger.log(...this._logHead(actor), lockCycle, "=(", maxAnimDuration, "+", currentAnimCooldown, ") * 1000")
        actor.state.actCoolDownEnd.set(actCode, aiScope.runner.tickId + Math.ceil(lockCycle / aiScope.runner.delta))

    }

    private _attachEvents(actor: iAActor, aiAction: eAiAction, maxAnimDuration: number) {
        if (aiActions[aiAction].events === undefined) return;

        // add event queue for this action
        const eventQueue = actor.state.actEventQueue;

        const {events} = aiActions[aiAction];
        eventQueue.set(aiAction, []);
        let event;
        for (let i = events.length - 1; i >= 0; i--) {
            event = events[i];
            // add reverse order, newer later, when remove it can be easily removed from tail
            eventQueue.get(aiAction).push([
                aiScope.runner.tickId + Math.ceil(event[0] * maxAnimDuration * 1000 / aiScope.runner.delta),
                event[1],
            ])
        }
    }

    private _detachEvents(actor: iAActor, aiAction: eAiAction) {
        if (aiActions[aiAction].events === undefined) return;

        actor.state.actEventQueue.get(aiAction) && actor.state.actEventQueue.delete(aiAction);
    }

    protected _expiredActions = new Set<eAiAction>();

    protected _cleanExpired(actor: iAActor) {
        this._expiredActions.clear();
        actor.state.animTrackEnd.forEach((trackEnd, index) => {
            if (trackEnd === 0 || trackEnd > Date.now()) return;

            const actionCode = actor.state.animTrackAction[index];
            actionCode > 0 && this._expiredActions.add(actionCode)
        })
        this._expiredActions.forEach(actionCode => this._unsetActAnim(actor, actionCode))
    }

    protected _cacheAct(actor: iAActor, actSub: eAiAction, actTrigger: eAiActionTrigger) {
        const {state} = actor as iAPawn;
        if (actor.opts.role === eObjectRole.authority) {
            switch (actTrigger) {
                case eAiActionTrigger.player:
                    state.cachedPlayerAct?.add(actSub)
                    break;
                case eAiActionTrigger.server:
                    state.cachedAiAct?.add(actSub)
                    break;
            }
        }
    }

    cacheActClear(actor: iAActor) {
        const {state} = actor as iAPawn;
        if (actor.opts.role === eObjectRole.authority) {
            state.cachedPlayerAct?.clear();
            state.cachedAiAct?.clear();
        }
    }

    protected _afterTick(actor: iAActor): void {
    }

    protected _beforeTick(actor: iAActor): void {
    }

    protected _tick(actor: iAActor): void {
    }
}