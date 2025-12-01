import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AzureFunctionsService } from './azure-functions.service';
import { RegistrationDetails } from '../models/RegistrationDetails';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(
    private http: HttpClient, 
    private azureFunctionsService: AzureFunctionsService
  ) { }

  /**
   * Get registration details
   * UPDATED: Now uses Azure Functions API (replaces /pro_userregroute)
   * No longer requires Authorization header or TokenService
   */
  getRegistrationDetails(confirmationCode: string): Observable<RegistrationDetails> {
    console.log('[RegistrationService.getRegistrationDetails] Fetching details for:', confirmationCode);
    return this.azureFunctionsService.getUserRegRoute(confirmationCode);
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { switchMap, map } from 'rxjs/operators';
// import { TokenService } from './token.service';
// import { RegistrationDetails } from '../models/RegistrationDetails';

// @Injectable({
//   providedIn: 'root'
// })
// export class RegistrationService {
//   private apiUrl = 'https://classreg.crm.dynamics.com/api/data/v9.1/pro_userregroute';

//   constructor(
//     private http: HttpClient, 
//     private tokenService: TokenService
//   ) { }

//   /**
//    * Get registration details
//    * NOTE: This API still uses Dynamics CRM with Authorization header
//    * per the API Changes document (TBD after registration API is complete)
//    */
//   getRegistrationDetails(confirmationCode: string): Observable<RegistrationDetails> {
//     return this.tokenService.getAccessToken().pipe(
//       switchMap(token => {
//         const headers = new HttpHeaders({
//           'Authorization': `Bearer ${token.access_token}`,
//           'Content-Type': 'application/json',
//           'OData-Version': '4.0',
//           'Accept': 'application/json'
//         });

//         const body = {
//           confirmationcode: confirmationCode
//         };

//         return this.http.post<any>(this.apiUrl, body, { headers: headers });
//       }),
//       map(response => JSON.parse(response.response))
//     );
//   }
// }