import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SaldoSerieDam } from '../model/bean/saldo-serie-dam';

import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';

@Injectable()
export class SaldoSerieDamService {

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) private  appEndPointConfig : AppEndpointConfig) {}

  buscar(codAduana : string, codRegimen: string, anio: number, numero: number): Observable<SaldoSerieDam[]> {
    let url : string = this.appEndPointConfig.getSaldoCtaCorrienteDam(codAduana, codRegimen, anio, numero);
    return this.http.get<SaldoSerieDam[]>(url);
  }

}
