export interface Pass {
    passId: string;
    passName: string;
    numberOfPassesLeft: number;
    numberOfPassesSold: number;
    price: number;
    currencySymbol: string;
    eventId: string;
    passesUsed: number;
    sessions: any[]; 
    customFields: {
        transactioncurrencyid: {
            Id: string;
            KeyAttributes: any[];
            LogicalName: string;
            Name: string;
            RowVersion: any | null;
        };
        [key: string]: any; // Allow for additional custom fields
    };
}


// export interface Pass {
//     passId: string;
//     passName: string;
//     numberOfPassesLeft: number;
//     numberOfPassesSold: number;
//     price: number;
//     currencySymbol: string;
//     passesUsed: number;
// }
