import {iASensor, iASensorOpts} from "./ASensor.type";

export interface iASensorBindOpts extends iASensorOpts {

}

export interface iASensorBind extends iASensor {
    opts: iASensorBindOpts,
}