import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { APP_ENDPOINT_CONFIG, AppEndpointConfig } from '../utils/app-endpoint-config';
import { PciDetalle } from '../model/bean/pci-detalle';

import { catchError } from 'rxjs/operators';

@Injectable()
export class BusquedaPciService {

  constructor(private http: HttpClient,
              @Inject(APP_ENDPOINT_CONFIG) private appEndPointConfig : AppEndpointConfig) { }

  buscarParaDpmn( codAduana: string, codPtoCtrl: string ): Observable<PciDetalle[]> {
    let url : string = this.appEndPointConfig.getPuestosControlParaDpmn(codAduana, codPtoCtrl);
    return this.http.get<PciDetalle[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
        })
    ) ;
  }
}
