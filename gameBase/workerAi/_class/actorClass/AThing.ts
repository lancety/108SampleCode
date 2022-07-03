import {iAThing} from "./AThing.type";
import {ObjectBase} from "../../../moduleObject/object";
import {epComponent} from "../../_component/Component.enum";
import {TickComponent} from "../../_component/tickComponent/TickComponent";
import {eObjectGroup} from "../../../moduleObjectGroup/objectGroup.enum";
import {AActorAction} from "./AActor.action";
import {iObjectKey} from "../../../moduleObjectGroup/objectKey.type";
import {iObjMap} from "../../../../script_base/util/object.type";
import {iPhysicsOpts} from "../../../modulePhysics/opts/physicsOpt.type";
import {iObjectAttr} from "../../../moduleObject/objectAttr.type";
import {iActorRenderInfo} from "../../../moduleActor/ARenderInfo.type";
import {objectAttrTypedUtil} from "../../../moduleObject/objectAttrTyped.util";
import {aiScope} from "../../../globalWorker/ai/aiScope";
import {eActorRenderStage, eActorSyncStage} from "./AActor.enum";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {eActorTag} from "./_actorTag.enum";


export class AThing<A extends iAThing = iAThing> extends ObjectBase<A> {
    protected _componentAction: unknown = AActorAction;

    public gp: eObjectGroup;    // set when Actor class

    /**
     * after new Actor class, this will be called from class ref file for post init logic
     */
    public postInit() {
        this._componentsInit();
        this._componentsWatch();
        this._attrRepWatchInit();
    }


    /**
     * create new actor instance
     * @param keys
     * @param opts
     * @param attrs
     */
    public create(keys: iObjectKey, opts: iPhysicsOpts, attrs: iObjMap<unknown>): A {
        return super.create(keys, opts, attrs) as A;
    }

    protected _initOpts(obj: A, ...ignore) {
        super._initOpts(obj, ...ignore);

        obj.opts.abGroup = eActorBaseGroup.thing;
        obj.opts.tags = new Set();
        obj.opts.tags.add(eActorTag.dataActor);
    }

    protected _initState(obj: A, ...ignore) {
        super._initState(obj, ...ignore);

        obj.state.syncStage = eActorSyncStage.created;
        obj.state.renderStage = eActorRenderStage.hidden;
    }

    /*
    *
    * events
    *
    * */

    protected _attrRepWatchInit() {

    }

    /**
     * this handler happens before attr new value set, so both old and new value available
     * @protected
     */
    protected _attrRepHandler: iObjMap<Array<(actor, attr, newVal) => void>> = {};

    protected _attrRepHandlerWatch(attrName: string, handler: (actor, attr, newVal) => void) {
        this._attrRepHandler[attrName] = this._attrRepHandler[attrName] || [];
        this._attrRepHandler[attrName].push(handler);
    }

    public onAttrRep(actor: A, attr: iObjectAttr, newVal: unknown) {
        this._attrRepHandler[attr.name]?.forEach(handler => handler(actor, attr, newVal));
    }

    /**
     * logics when create this actor instance
     * @param {A} actor
     */
    public onAdd(actor: A) {

    }

    /**
     * logics when destroy this actor instance
     * @param {A} actor
     * @protected
     */
    public onRemove(actor: A) {

    }

    /*
    *
    * actor ticking
    *
    * */

    /**
     * called directly by ai engine
     * AActor is singleton class instance, it load ai behavior tree once for all class actors of this type.
     *
     * @param actor
     */
    public tick(actor: A) {
        this._componentsTick(actor);
    }


    /*
    *
    * components
    *
    * */

    protected _componentsInit() {
    }
    protected _componentsWatch() {
        this._componentWatchPhysics();
    }

    /**
     * Actor custom logic when 2 actor physics collision events happening
     * @protected
     */
    protected _componentWatchPhysics() {
        /*
    protected _physicsWatch() {
        this.componentGet<PhysicsComponent>(epPhysicsComponent.physics)
            .watchCollideStart((actorSelf: A, actorOther: iAActor) => {

            })
            .watchCollideEnd((actorSelf: A, actorOther: iAActor) => {

            })
    }
        * */
    }

    protected _components: { [key in epComponent]?: TickComponent<A> } = {};

    protected _componentsTick(actor: A): void {
        /**
         * only TickComponent has 'onTick'
         */
        Object.values(this._components).forEach(c => c.onTick && c.onTick(this, actor));
    }

    public componentReg<CP>(componentCode: epComponent, componentClass: unknown, props: CP): TickComponent {
        if (componentClass === undefined) {
            console.error(`no component class named ${componentCode}`);
            return;
        }
        if (this._components[componentCode]) {
            return;
        }

        // @ts-ignore
        if (componentClass.isPropsValid(props) === false) {
            return;
        }

        // @ts-ignore
        this._components[componentCode] = new componentClass(props);
        return this._components[componentCode];
    }

    public componentGet<CC>(componentCode: epComponent): CC | undefined {
        return this._components[componentCode] as unknown as CC;
    }

    public exportRenderInfo(actor: A, force = false): iActorRenderInfo {
        const attrTypedBuffer = objectAttrTypedUtil.typedBufferTemplate(actor.path);
        const attrTyped = objectAttrTypedUtil.attr2TypedBuffer(actor, (attr) => {
            return force || (attr.opts.bRender && attr.tickId === aiScope.runner.tickId);
        }, attrTypedBuffer) || attrTypedBuffer;
        const info: iActorRenderInfo = {
            path: actor.path,
            attrsTyped: attrTyped,
        }
        return info;
    }
}