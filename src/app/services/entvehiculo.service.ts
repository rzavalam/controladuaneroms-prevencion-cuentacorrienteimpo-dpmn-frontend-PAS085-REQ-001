import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entvehiculo } from '../model/bean/entvehiculo';

import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';

@Injectable()
export class EntvehiculoService {

  private URL_RESOURCE_ENTVEHICULO : string;

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_ENTVEHICULO = appEndPointConfig.entvehiculo;
  }

  buscar(codPais: string, codPlaca: string) : Observable<Entvehiculo> {
    let url : string = this.URL_RESOURCE_ENTVEHICULO + "/" + codPais + "-" + codPlaca;
    return this.http.get<Entvehiculo>(url);
  }
}
