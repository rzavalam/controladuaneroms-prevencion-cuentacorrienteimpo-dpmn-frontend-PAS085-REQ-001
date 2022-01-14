import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GuiaRemisionTransp } from '../model/bean/guia-remision-transp.model';
import { Respuesta } from '../model/common/Respuesta';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Estado } from '../model/common/Estado';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';

@Injectable()
export class GuiaRemisionService {

  private URL_RESOURCE_GUIA_REMISION : string;

  private rptaGuiaRemision  : Respuesta<GuiaRemisionTransp>;
  private rptaGuiaRemisionSource  = new BehaviorSubject<Respuesta<GuiaRemisionTransp>>(null);;
  public rptaGuiaRemision$ = this.rptaGuiaRemisionSource.asObservable();

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_GUIA_REMISION = appEndPointConfig.guiaRemision;
  }

  public buscar (ruc: string, serie: string, numero: string) : void {
    let faltaRuc : boolean = ruc == null || ruc.length <= 0;
    let faltaSerie : boolean = serie == null || serie.length <= 0;

    if ( faltaRuc || faltaSerie ) {
      return;
    }

    let urlNumGuiaBuscar : string = this.URL_RESOURCE_GUIA_REMISION + "/" +  `${ruc}-${serie}-${numero}`;

    this.rptaGuiaRemisionSource.next(Respuesta.create(null, Estado.LOADING));

    this.buscarHttp(urlNumGuiaBuscar).subscribe(objGuiaRemision => {
        this.rptaGuiaRemision = Respuesta.create(objGuiaRemision, Estado.SUCCESS);
        this.rptaGuiaRemisionSource.next(this.rptaGuiaRemision);
    });
  }

  private buscarHttp(url: string) : Observable<GuiaRemisionTransp> {
    return this.http.get<GuiaRemisionTransp>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaGuiaRemisionSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    ) ;
  }

}
