
/*import { environment } from './../../environments/environment.dev'*/
import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHelper } from '../helpers/HttpHelper';
import { PaymentRequest } from '../models/PaymentRequest';
import { AnonymousSubject } from 'rxjs/internal/Subject';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private static readonly paymentEndpoint: string = environment.paymentEndpoint;

    constructor(private http: HttpHelper) { }

    public getPaymentGateway(readableEventId): Observable<any> {
        return this.http.get<any>(`${environment.baseUrl}${PaymentService.paymentEndpoint}/gateway/?readableEventId=${readableEventId}`);
    }

    public getBoltDevices(gatewayId, filterAmount = null): Observable<any> {
        if (filterAmount) {
            //return this.http.post<any>(`${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/devices`,
            //    {
            //        gatewayid: gatewayId,
            //        filter: filterAmount
            //    });
            const params = encodeURI('{"gatewayid": "' + gatewayId + ', "filter": "' + filterAmount + '"}');
            const url = `${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/devices?json=` + params;
            return this.http.post<any>(url, null);
        }
        //return this.http.post<any>(`${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/devices`,
        //    {
        //        gatewayid: gatewayId
        //    });
        const params = encodeURI('{"gatewayid": "' + gatewayId + '", "user": "' + sessionStorage.getItem('AgentId') + '"}');
        const url = `${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/devices?json=` + params;
        return this.http.post<any>(url, null);
    }

    public tokenizeBolt(gatewayId, HSN, total): Observable<any> {
        //return this.http.post<any>(`${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/tokenize`,
        //    {
        //        gatewayid: gatewayId,
        //        hsn: HSN,
        //        amount: total
        //    });
        const params = encodeURI('{"gatewayid": "' + gatewayId + '","hsn": "' + HSN + '","amount": "' + total + '"}');
        const url = `${environment.baseUrl}${PaymentService.paymentEndpoint}/bolt/tokenize?json=` + params;
        return this.http.post<any>(url, null);
    }

    public authorizePayment(paymentRequest: PaymentRequest): Observable<any> {
        return this.http.post<any>(`${environment.baseUrl}${PaymentService.paymentEndpoint}/authorize/`, paymentRequest);
    }
}
