export interface SearchOptions {
    regions: SearchOptionsItems[];
    ministries: SearchOptionsItems[];
    servicelines: SearchOptionsItems[];
}

export interface SearchOptionsItems {
    cmscode: string;
    name: string;
    logo: string;
    target: string;
}
