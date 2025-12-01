import { Building } from './Building';
import { Room } from './Room';

export interface Session {
    customFields: any | null;
    alreadyRegistered: boolean | null;
    building: Building;
    camerasPermitted: boolean | null;
    detailedDescription: string;
    endTime: Date; 
    endTimeUTC: string; 
    endTimeString?: string; // Added for display purposes
    id: string;
    isCapacityRestricted: boolean | null;
    language: number | null;
    maxCapacity: number | null;
    name: string;
    recordingsPermitted: number | null;
    registrationCount: number;
    room: Room | null;
    sessionFormat: string; 
    sessionObjectives: string;
    sessionPreRequisites: string;
    sessionSummary: string;
    sessionType: number | null;
    speakers: any[]; 
    startTime: Date; 
    startTimeUTC: string; 
    startTimeString?: string; // Added for display purposes
    timeZone: string; 
    userEligibleToRegister: boolean | null;
}


