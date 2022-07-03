import {vector2} from "../../../../script_base/@type/graph";
import {graphVec2} from "../../../../script_base/graph/vec2";
import {float} from "../../../../script_base/util/number";
import {eObjAttrRepMode} from "../../../moduleObject/objectAttr.enum";
import {eSchemaType} from "../../../moduleSchema/schema.enum";
import {iABody} from "./ABody.type";
import {ACharacterAction} from "./ACharacter.action";
import {ACharacterAttrsConfMap, epACharacterAttrs} from "./ACharacter.attr.enum";
import {eACharacterMovement} from "./ACharacter.enum";
import {iACharacter, iACharacterOpts} from "./ACharacter.type";
import {APawn} from "./APawn";
import {iAPawn} from "./APawn.type";
import {physicsActionUtil} from "../../../modulePhysics/physicsActions.util";
import {ePhysicsAction} from "../../../modulePhysics/physicsActions.type";
import {AActorUtil} from "./AActor.util";
import {eActorBaseGroup} from "./_actorBaseGroup.enum";
import {iObjMap} from "../../../../script_base/util/object.type";
import {objectAttrUtil} from "../../../moduleObject/objectAttr.util";
import {iInputActCacheMove, iInputActCacheView} from "../../../moduleControl/control/control.type";
import {eAbsAction} from "../../../moduleAction/action.enum";

export class ACharacter<A extends iACharacter = iACharacter, O extends iACharacterOpts = iACharacterOpts> extends APawn {
    protected _componentAction: unknown = ACharacterAction;

    protected _initOpts(actor: A, opts: O) {
        super._initOpts(actor, opts);

        actor.opts.abGroup = eActorBaseGroup.character;
        actor.opts.removeDelay = 120000;
    }

    protected _initState(actor: iACharacter) {
        super._initState(actor);
        actor.state.tickBt = true;
    }

    public initAttrs(actor: iACharacter, opts: iACharacterOpts, attrs: iObjMap<unknown>) {
        super.initAttrs(actor, opts, attrs);

        actor.attrs[epACharacterAttrs.moveState] = objectAttrUtil.attrInit(ACharacterAttrsConfMap[epACharacterAttrs.moveState], {
            bufferType: eSchemaType.uint8,
        }, actor, attrs[epACharacterAttrs.moveState], eACharacterMovement.idle);

        actor.attrs[epACharacterAttrs.moveSpeed] = objectAttrUtil.attrInit(ACharacterAttrsConfMap[epACharacterAttrs.moveSpeed], {
            bufferType: eSchemaType.float32,
            bReplicateMode: eObjAttrRepMode.tcp,
            min: 0,
        }, actor, attrs[epACharacterAttrs.moveSpeed], 4);

        actor.attrs[epACharacterAttrs.idlePos] = objectAttrUtil.attrInit(ACharacterAttrsConfMap[epACharacterAttrs.idlePos], {
            bufferType: eSchemaType.float32,
            bCache: true,
        }, actor, attrs[epACharacterAttrs.idlePos], [0, 0]);
    }

    /*
    *
    * IO functions
    *
    * */

    /**
     * proceed means goto position
     *
     * @param self
     * @param actor
     */
    public ioPosProceed(self: iACharacter, actor: iABody): vector2<float> {
        // point, angle, extendLength
        return AActorUtil.posAround(
            actor,
            1,
            graphVec2.radian(AActorUtil.pos(actor), AActorUtil.pos(self)),
        );
    }

    /**
     * calculate multi position with random angle and distance, then try to find path of any one of them
     *
     * @param self
     * @param actor
     */
    public ioPosRunaway(self: iACharacter, actor: iAPawn) {
        // point, angle, extendLength
        const targetPos = AActorUtil.pos(actor), selfPos = AActorUtil.pos(self);
        const pos = graphVec2.pointOfPointAngle(
            selfPos,
            graphVec2.angle(targetPos, selfPos),
            30,
        );

        return pos;
    }

    public handleView(actor: iACharacter, input: iInputActCacheView) {
        // view radian
        if (Math.abs(actor.attrs.angle.value - input[eAbsAction.view]) > 0.0001) {
            physicsActionUtil.push(actor.path, ePhysicsAction.rotate, input[eAbsAction.view]);
        }
    }

    public handleMove(actor: iACharacter, input: iInputActCacheMove) {
        // movement velocity
        const moveAction = physicsActionUtil.moveCtrl2Action(actor, input);
        if (moveAction[0] > 10 || moveAction[0] < -10 || moveAction[1] > 10 || moveAction[1] < -10) {
            console.error('move too far', moveAction);
        }
        if (isNaN(moveAction[0]) || isNaN(moveAction[1])) {
            console.error("move is illegal", moveAction);
            // const moveActionTest = physicsActionUtil.moveCtrl2Action(newInput, pActor);
            return;
        }
        if (actor.attrs.vx.value !== moveAction[0] || actor.attrs.vy.value !== moveAction[1]) {
            physicsActionUtil.push(actor.path, ePhysicsAction.vel, moveAction);
        }
    }
}