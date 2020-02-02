import { EventListener } from "./eventListener";


const eventListener = EventListener.get();

const deviceLib: Map<number, ConnectedDevice> = new Map();

export function getDevice(deviceId: number){
    if(!deviceLib.has(deviceId)){
        throw new Error('The device does not exist: ' + deviceId);
    }
    return deviceLib.get(deviceId)!;
}
export function getAllDevices(){
    const result = [];
    for(let a of deviceLib.values()){
        result.push(a);
    }
    return result;
}


let internalID = 0;

export interface ConnectedDeviceData {
    internalID: number;
    deviceId: number;
}

export class ConnectedDevice {

    internalID = internalID++;
    stateData: any;
    customStateData: any;

    constructor(public deviceId: number, ){
        deviceLib.set(deviceId, this);
        eventListener.trigger('deviceJoined', this);
    }

    disconnect() {
        deviceLib.delete(this.deviceId);
        eventListener.trigger('deviceDisconnected', this);
    }

    updateState(data: any){
        this.stateData = data;
    }
    updateCustomState(data: any){
        this.customStateData = data;
    }

    toJson(): ConnectedDeviceData{
        return {
            internalID: this.internalID,
            deviceId: this.deviceId,
        }
    }
}  