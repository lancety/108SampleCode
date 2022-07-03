/*
*
* why this is separated from attr options in each AActor and subclass?
*  1. typed attr only have attr index, it cannot get iAActor.attrs options, so need to be defined here, then share to iAActor opts
*  2. list of different attr type used by behavior tree, by collecting all attr conf here made possible to categorize
*  3. for custom module feature, need a place to append additional attrs dynamically, this is useful
*
* */

import {AActorAttrsConf} from "../workerAi/_class/actorClass/AActor.attr.enum";
import {ABodyAttrsConf} from "../workerAi/_class/actorClass/ABody.attr.enum";
import {APawnAttrsConf} from "../workerAi/_class/actorClass/APawn.attr.enum";
import {ACharacterAttrsConf} from "../workerAi/_class/actorClass/ACharacter.attr.enum";
import {ACPlayerAttrsSizeConf} from "../workerAi/_class/actorGroup/character/ACPlayer.attr.enum";
import {eAttrConfigIndex, iAttrConfig} from "./objectAttrConfig.type";
import {eNodeBasePropsType} from "../../script_module/behaviorEditor/src/behaviorTree/core/nodeBase.props.enum";
import {ASTSpawnAttrsConf} from "../workerAi/_class/actorGroup/sensorTrigger/ASTSpawn.attr.enum";
import {InteractComponentAttrsConf} from "../workerAi/_component/interactComponent/InteractComponent.attr.enum";
import {ItemMultiComponentAttrsConf} from "../workerAi/_component/itemComponent/ItemMultiComponent.attr.enum";
import {ItemSingleComponentAttrsConf} from "../workerAi/_component/itemComponent/ItemSingleComponent.attr.enum";
import {SpineComponentAttrsConf} from "../workerAi/_component/spineComponent/SpineComponent.attr.enum";
import {PhysicsComponentAttrsConf} from "../workerAi/_component/physicsComponent/PhysicsComponent.attrs.enum";

export const AttrConfigs = [
    /*
    *
    * actor attributes
    *
    * */
    ...AActorAttrsConf,
    ...ABodyAttrsConf,
    ...APawnAttrsConf,
    ...ACharacterAttrsConf,

    ...ACPlayerAttrsSizeConf,

    ...ASTSpawnAttrsConf,


    /*
     *
     * component attributes
     *
     */
    ...PhysicsComponentAttrsConf,
    ...SpineComponentAttrsConf,
    ...InteractComponentAttrsConf,
    ...ItemSingleComponentAttrsConf,
    ...ItemMultiComponentAttrsConf,
]
AttrConfigs.forEach((conf, index) => {
    conf.index = index;
})

export const AttrConfigsMap = {};
AttrConfigs.forEach((attrConf, index) => {
    AttrConfigsMap[attrConf[eAttrConfigIndex.name]] = attrConf;
})


/**
 * it is same value for both array item because KV is for select behavior tree dom
 * @param confs
 */
function _attrsVKs<T>(confs: iAttrConfig[]): [string, string][] {
    return confs.map(conf => [conf[eAttrConfigIndex.name], conf[eAttrConfigIndex.name]]);
}

export const allAttrs = _attrsVKs(AttrConfigs);

export const allAttrsString = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.string));
export const allAttrsNumber = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.number));
export const allAttrsBool = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.bool));
export const allAttrsVec2 = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.vec2));
export const allAttrsVec3 = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.vec3));
export const allAttrsVec4 = _attrsVKs(AttrConfigs.filter(conf => conf[eAttrConfigIndex.type] === eNodeBasePropsType.vec4));

export const allAttrsEnums = AttrConfigs.filter(conf => conf[eAttrConfigIndex.enumVK]).map(conf => [conf[eAttrConfigIndex.name], conf[eAttrConfigIndex.name]] as [string, string]);
