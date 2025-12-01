import { Attendee } from './Attendee';
import { HipObject } from './HipObject';

export interface FinalizeRegistrationRequest {
    purchaseid: string;
    paymentid: string;
    attendee: Attendee;
    hipObject: HipObject;
}
