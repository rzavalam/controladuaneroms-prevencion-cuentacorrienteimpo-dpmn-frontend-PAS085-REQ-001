import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';
import { UbicacionFuncionario } from '../model/bean/ubicacion-funcionario';

@Injectable()
export class UbicacionFuncionarioService {

  private URL_RESOURCE_UBICACION_FUNCIONARIO : string;

  constructor(private http: HttpClient,
    @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
      this.URL_RESOURCE_UBICACION_FUNCIONARIO = appEndPointConfig.ubicacionFuncionario;
  }

  buscar(codFuncionario: string) : Observable<UbicacionFuncionario> {
    var url : string = this.URL_RESOURCE_UBICACION_FUNCIONARIO + "/" + codFuncionario;
    return this.http.get<UbicacionFuncionario>(url);
  }
}
