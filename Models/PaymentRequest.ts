export interface PaymentRequest {
    gatewayid: string;
    amount: number;
    token: string;
    expiry: string;
    cvv: string;
    accountname: string;
    firstname: string;
    lastname: string;
    emailaddress: string;
    address: string;
    city: string;
    region: string;
    postalcode: string;
    country: string;
    eventid: string;
    passid: string;
    purchaseid: string;
}
