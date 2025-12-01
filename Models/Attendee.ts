import { CustomRegistrationFieldResponse } from './CustomRegistrationFieldResponse';
import { Pass } from './Pass';
import { AddOn } from './AddOn';
import { Discount } from './Discount';

export interface Attendee {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    passId: string;
    pass: Pass;
    waitlisted: boolean;
    autoRegister: boolean;
    responses: CustomRegistrationFieldResponse[];
    chosenAddons: AddOn[];
    selectedDiscount: Discount;
}
