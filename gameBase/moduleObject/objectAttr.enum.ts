
export enum eObjectAttrType {
    num,
    numArray,
    str,
    bool,
    obj = 10,  // game item instance
    objArray,
}

/**
 * object attribute's replication mode
 */
export enum eObjAttrRepMode {
    udp,
    tcp,
}