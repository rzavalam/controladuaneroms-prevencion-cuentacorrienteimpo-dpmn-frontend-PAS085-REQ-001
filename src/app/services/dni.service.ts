import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { APP_ENDPOINT_CONFIG, AppEndpointConfig } from '../utils/app-endpoint-config'

import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { Dni } from '../model/bean/dni.model';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DniService {

  private URL_RESOURCE_DNI : string;

  private rptaDni  : Respuesta<Dni>;
  private rptaDniSource  = new BehaviorSubject<Respuesta<Dni>>(null);;
  public rptaDni$ = this.rptaDniSource.asObservable();

  constructor(private http: HttpClient,
    @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_DNI = appEndPointConfig.dni;
  }

  public buscar(numDni : string) {
    let regexDNI : RegExp = /[0-9]{8}/;

    var dniEsInvalido =  numDni == null || !numDni.match(regexDNI);

    if ( dniEsInvalido ) {
      this.rptaDni = Respuesta.create(null, Estado.SUCCESS);
      this.rptaDniSource.next(this.rptaDni);
      return;
    }

    this.rptaDni = Respuesta.create(null, Estado.LOADING);
    this.rptaDniSource.next(this.rptaDni);

    this.buscarDniHttp(numDni).subscribe(objDni => {
        this.rptaDni = Respuesta.create(objDni, Estado.SUCCESS);
        this.rptaDniSource.next(this.rptaDni);
    });
  }

  private buscarDniHttp(numDni : string) : Observable <Dni> {
    var url = this.URL_RESOURCE_DNI + "/" + numDni;
    return this.http.get<Dni>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaDniSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    ) ;
  }
}
