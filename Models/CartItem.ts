import { Event } from './Event';
import { Attendee } from './Attendee';
import { Pass } from './Pass';
import { Discount } from './Discount';

export interface CartItem {
    attendee: Attendee;
    event: Event;
    purchaseId: string;
    confirmation?: string;
    available: string;
    registrationId: string;
}
