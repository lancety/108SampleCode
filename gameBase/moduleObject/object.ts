import {baseScope} from "../global/baseScope";
import {eEngineMode} from "../global/baseScope.enum";
import {objPathArr} from "../moduleObjectGroup/objectPath";
import {eObjectRole} from "./object.role";
import {iObjectBase, iObjectBaseAttrs, iObjectBaseOpts, iObjectBaseState} from "./object.type";
import {iObjectAttr} from "./objectAttr.type";
import {iObjectKey} from "../moduleObjectGroup/objectKey.type";
import {epObjectGroupPathIndex} from "../moduleObjectGroup/objectPath.type";
import {asServer} from "../globalWorker/ai/asServer";

/**
 * Object manages 'opts' and 'attrs'
 */
export class ObjectBase<A extends iObjectBase = iObjectBase, O extends iObjectBaseOpts = iObjectBaseOpts> {
    public nextId = 1;

    constructor() {

    }

    /**
     * sometime need to read attr by prop name, which wont detect type as iObjectAttr, use this for typing purpose
     * @param {iObjectBase} obj
     * @param {string} attrName
     * @returns {iObjectAttr}
     */
    static getAttr(obj: iObjectBase, attrName: string): iObjectAttr  {
        return obj.attrs[attrName];
    }

    create(keys: iObjectKey, ...ignore): iObjectBase {
        let gb, gp, gi, gbp, gpp, gip;
        if (Array.isArray(keys)) {
            [gb, gp, gi, gbp, gpp, gip] = keys;
        } else {
            gb = keys.gb;
            gp = keys.gp;
            gi = keys.gi;
            gbp = keys.gbp;
            gpp = keys.gpp;
            gip = keys.gip;
        }

        if (gi >= 0) {
            // console.log("id==", gb, gp, gi, gbp, gpp, gip);
        } else {
            gi = this.nextId++;
            asServer.actorClassIdAnchor[gp] = this.nextId;
            // console.log("id++", gb, gp, gi, gbp, gpp, gip);
        }
        const path = objPathArr.get(gb, gp, gi);

        const obj: iObjectBase = {
            gb: path[epObjectGroupPathIndex.gb],
            gp: path[epObjectGroupPathIndex.gp],
            gi: path[epObjectGroupPathIndex.gi],
            gbp,gpp,gip,
            path,
            opts: undefined,
            attrs: undefined,
            state: undefined,
            createTimestamp: Date.now(),
        };
        this._initOpts(obj, ...ignore);
        this._initState(obj, ...ignore);
        this.initAttrs(obj, ...ignore);

        return obj;
    }

    /**
     * default opts, can be modified by children
     * @returns {iObjectBaseOpts}
     * @protected
     */
    protected _initOpts(obj: iObjectBase, ...ignore) {
        const {engineMode} = baseScope;
        obj.opts = obj.opts || {
            role: undefined,
            roleRemote: undefined,
        };
        switch (engineMode) {
            case eEngineMode.clientGeckos:
                obj.opts.role = eObjectRole.simulated;
                obj.opts.roleRemote = eObjectRole.authority;
                break;
            case eEngineMode.serverGeckos:
                obj.opts.role = eObjectRole.authority;
                obj.opts.roleRemote = eObjectRole.simulated;
                break;
            case eEngineMode.serverBrowser:
                obj.opts.role = eObjectRole.authority;
                obj.opts.roleRemote = eObjectRole.none;
                break;
        }
    }

    protected _initState(obj: iObjectBase, ...ignore) {
        obj.state = {} as iObjectBaseState;
    }

    public initAttrs(obj: iObjectBase, ...ignore) {
        obj.attrs = {} as iObjectBaseAttrs;
    }
}
