import { Building } from './Building';
import { Room } from './Room';
import { Image } from './Image';

export interface Event {
    customFields?: any;
    autoregisterWaitlistItems: boolean;
    building: Building;
    description: any;
    endDate: Date;
    endDateString: string;
    eventFormat: number;
    eventId: string;
    eventLanguage: number;
    eventName: string;
    eventType: number;
    image: Image;
    maxCapacity: number;
    publicEventUrl: string;
    readableEventId: string;
    room: Room;
    showAutomaticRegistrationCheckbox: boolean;
    showWaitlist: boolean;
    startDate: Date;
    startDateString: string;
    timeZone: number;
    timeZoneName: string;
    optionforAddress_Zipcode: number;
    redirectclass: boolean;
    redirecturl: string;
}