import {epInteractComponent} from "./interactComponent/InteractComponent.enum";
import {epTickComponent} from "./tickComponent/TickComponent.enum";
import {epItemComponent} from "./itemComponent/ItemComponent.enum";
import {epSpineComponent} from "./spineComponent/SpineComponent.enum";
import {epPhysicsComponent} from "./physicsComponent/PhysicsComponent.enum";


export type epComponent =
    epPhysicsComponent |
    epSpineComponent |
    epTickComponent |
    epInteractComponent |
    epItemComponent
    ;
export const epComponent = {
    ...epPhysicsComponent,
    ...epSpineComponent,
    ...epTickComponent,
    ...epInteractComponent,
    ...epItemComponent,
}