import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Empredti } from '../model/bean/empredti';

import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';

@Injectable()
export class EmpredtiService {

  private URL_RESOURCE_EMPREDTI : string;

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_EMPREDTI = appEndPointConfig.empresasdetranspinter;
  }

  buscar(codigo: string) : Observable<Empredti> {
    let url: string = this.URL_RESOURCE_EMPREDTI + "/" + codigo;
    return this.http.get<Empredti>(url);
  }

}
