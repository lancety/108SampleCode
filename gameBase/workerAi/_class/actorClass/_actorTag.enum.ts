
export enum eActorTag {
    /*
    *
    * boolean / flag
    *
    * */
    dataActor = 1,  // it is data actor

    /*
    *
    * specific
    *
    * */
    itemCont,        // actor is a container of single item, e.g. loot item
    itemMultiCont,   // actor is a container of multi items, e.g. item cont sprite, inventory

}