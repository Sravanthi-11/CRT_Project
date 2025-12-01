import { Building } from './Building';
import { Room } from './Room';
import { Image } from './Image';

export interface Event2Region {
    Name: string;
    CMSCode: string;
}

export interface Event2Ministry {
    Name: string;
    CMSCode: string;
}

export interface Event2Building {
    Name: string;
    City: string;
    StateProvince: string;
    CMSCode: string;
}

export interface Event2ServiceLine {
    Name: string;
    CMSCode: string;
}

export interface Event2 {
    ReadableEventId: string;
    Name: string;
    EventType: string;
    Description: string;
    StartDate: string;
    EndDate: string;
    Region: Event2Region;
    Ministry: Event2Ministry;
    Building: Event2Building;
    ServiceLines: Event2ServiceLine[];
    Pricing: string;
    SpacesAvailable: number;
    MoreEvents: boolean;
    RegistrationRequired: boolean;
    SelfPaced: boolean;
    RedirectClass: boolean;
    RedirectURL: string | null;
    MaximumEventCapacity: number;
    ClassStatus: string;
    TimeZoneName?: string;
    
    // Legacy lowercase properties for backward compatibility
    building?: any;
    description?: any;
    enddate?: string;
    eventtype?: string;
    ministry?: any;
    name?: string;
    readableeventid?: string;
    servicelines?: any;
    startdate?: string;
    pricing?: string;
    spacesavailable?: number;
    moreevents?: boolean;
    registrationrequired?: boolean;
    redirectclass?: boolean;
    redirecturl?: string;
    selfpaced?: boolean;
    maximumeventcapacity?: number;
    classstatus?: string;
    
    // For UI purposes
    showMore?: boolean;
}

export interface DynamicsSearchResponse {
    '@odata.context': string;
    pro_response: string; // JSON string that needs to be parsed
}

export interface SearchEventsResponse {
    items: Event2[];
}
