import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ParamBusqDpmnParaRectificar } from '../model/bean/param-busq-dpmn-rectificar.model';
import { ItemDpmnParaRectificar } from '../model/bean/item-dpmn-para-rectificar.model';

import { map, catchError } from 'rxjs/operators';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Auditoria } from '../model/domain/auditoria.model';

/**
 * Servicio para la busqueda de DPMN que pueden ser rectificadas
 */
@Injectable()
export class BuscarRectiDpmnService {

  private URL_RESOURCE_BUSQUEDA_DPMN : string;

  private rptaBusqDclSource = new BehaviorSubject<Respuesta<ItemDpmnParaRectificar[]>>(null);

  public rptaBusqDcl$ = this.rptaBusqDclSource.asObservable();
 
  public rptaListaCtrlDpmns: ItemDpmnParaRectificar[] ;

  public itemDpmn: ItemDpmnParaRectificar = new ItemDpmnParaRectificar();

  constructor(private http: HttpClient,
             @Inject(APP_ENDPOINT_CONFIG) private appEndPointConfig : AppEndpointConfig) {
             this.URL_RESOURCE_BUSQUEDA_DPMN = appEndPointConfig.buscarParaRectificar;
  }
  
  buscarParaRectificar( paramBusqDpmnRecti : ParamBusqDpmnParaRectificar ) : void {
    
    this.rptaBusqDclSource.next(Respuesta.create(null, Estado.LOADING));
    console.log("1ero")

    this.validarDpmnsHttp(paramBusqDpmnRecti).subscribe((respuesta : Respuesta<ItemDpmnParaRectificar[]>) => {
      this.rptaBusqDclSource.next(respuesta);
      this.rptaListaCtrlDpmns = respuesta.data;
      console.log("2do")
    });

  };

  private validarDpmnsHttp( paramBusqDpmnRecti : ParamBusqDpmnParaRectificar ): Observable<Respuesta<ItemDpmnParaRectificar[]>> {
    return this.http.post<any>(this.URL_RESOURCE_BUSQUEDA_DPMN, paramBusqDpmnRecti).pipe(
          map(dpmns => {

            if ( dpmns == null ) {
              return Respuesta.create(null, Estado.SUCCESS);
            }

            var lstItemDpmnParaRectificar : ItemDpmnParaRectificar[]  = new Array();

            dpmns.forEach((itemDpmn : any) => {

              var newDmpm = new ItemDpmnParaRectificar();
              newDmpm.correlativoDpmn = itemDpmn?.correlativoDpmn;
              newDmpm.numeroDpmn = itemDpmn?.numeroDpmn  ;
              newDmpm.paisPlaca = new DataCatalogo();
              newDmpm.paisPlaca = itemDpmn?.paisPlaca;
              newDmpm.nomPlaca = itemDpmn?.nomPlaca;
              newDmpm.paisPlacaCarreta = new DataCatalogo();
              newDmpm.paisPlacaCarreta = itemDpmn?.paisPlacaCarreta;
              newDmpm.nomPlacaCarreta = itemDpmn?.nomPlacaCarreta;
              newDmpm.flujoVehiculo = new DataCatalogo();
              newDmpm.flujoVehiculo = itemDpmn?.flujoVehiculo;
              newDmpm.auditoria = new Auditoria();
              newDmpm.auditoria = itemDpmn?.auditoria;
              newDmpm.tiempoAnulacion = itemDpmn?.tiempoAnulacion;
              newDmpm.numRucPrimerRemitente = itemDpmn?.numRucPrimerRemitente;
              newDmpm.desRazonSocialPrimerRemitente = itemDpmn?.desRazonSocialPrimerRemitente;
              newDmpm.cntSeries = itemDpmn?.cntSeries;
              newDmpm.actorRegistro =  new DataCatalogo();
              newDmpm.actorRegistro =itemDpmn?.actorRegistro;


              lstItemDpmnParaRectificar.push(newDmpm);

            });

        return Respuesta.create(lstItemDpmnParaRectificar, Estado.SUCCESS);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaBusqDclSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    );
  }

  limpiarData() : void {
		this.itemDpmn = new  ItemDpmnParaRectificar();
    this.rptaBusqDclSource.next(Respuesta.create(null, null));
	}
}
