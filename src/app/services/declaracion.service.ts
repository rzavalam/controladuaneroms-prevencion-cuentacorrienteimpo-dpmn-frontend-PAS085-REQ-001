import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Declaracion } from '../model/bean/declaracion';

import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';

@Injectable()
export class DeclaracionService {

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) private appEndPointConfig : AppEndpointConfig) { }

  buscar(codAduana : string, codRegimen: string, anio: number, numero: number) : Observable<Declaracion> {
    let urlDeclaracion = this.appEndPointConfig.declaraciones + "/" + `${codAduana}-${codRegimen}-${anio}-${numero}`;
    return this.http.get<Declaracion>(urlDeclaracion);
  }

}
