import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { PuestoControl } from '../model/bean/PuestoControl';
import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { HttpClient } from '@angular/common/http';

import { catchError, map, shareReplay } from 'rxjs/operators';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';

@Injectable()
export class PuestoControlService {

private mapCacheJsonPuestoControl : Map<string, Observable<PuestoControl[]>> = new Map();

private URL_RESOURCE_PUESTOS_CONTROL : string;

  private rptPuestoControl : Respuesta<PuestoControl[]> = Respuesta.create(null, Estado.LOADING);
  private rptPuestoControlSource = new BehaviorSubject<Respuesta<PuestoControl[]>>(null);
  public rptPuestoControl$ = this.rptPuestoControlSource.asObservable();

  private cachePuestoControl = {};

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_PUESTOS_CONTROL = appEndPointConfig.puestoControl;
  }

  obtenerPuestosControlFromJSON(codAduana : string) : void {
    this.rptPuestoControlSource.next(Respuesta.create(null, Estado.LOADING));

    this.getObsPuestoControlFromJson(codAduana).subscribe((puestosControl : PuestoControl[]) => {
      this.rptPuestoControl = Respuesta.create(puestosControl, Estado.SUCCESS);
      this.rptPuestoControlSource.next(this.rptPuestoControl);
    });
  }

  private getObsPuestoControlFromJson(codAduana : string) : Observable<PuestoControl[]> {
    let observableInCache = this.mapCacheJsonPuestoControl.get(codAduana);

    if ( observableInCache != null ) {
      return observableInCache;
    }

    observableInCache = this.http.get<any[]>("assets/json/puestos-control.json").pipe(
      map(res => {

        let lstPuestosControl : PuestoControl[] = new Array();

          if ( res == null ) {
            return lstPuestosControl;
          }

          let itemPuestoControl = res.find((item : any) => item.codAduana ==  codAduana );

          if ( itemPuestoControl == null ) {
            return lstPuestosControl;
          }

          itemPuestoControl.puestosControl.forEach(element => {
            let puestoControl : PuestoControl = new PuestoControl();
            puestoControl.codigo = element.codigo;
            puestoControl.descripcion = element.descripcion;
            lstPuestosControl.push(puestoControl);
          });

          return lstPuestosControl;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.mapCacheJsonPuestoControl.delete(codAduana);
        return EMPTY;
      })
    );

    this.mapCacheJsonPuestoControl.set(codAduana, observableInCache);

    return observableInCache;
  }

  obtenerPuestosControl(codAduana : string) : void {
    this.rptPuestoControlSource.next(this.rptPuestoControl);

    this.getPuestosControlHttp(codAduana).subscribe(puestosControl => {
        this.rptPuestoControl = Respuesta.create(puestosControl, Estado.SUCCESS);
        this.rptPuestoControlSource.next(this.rptPuestoControl);
    });
  }

  private getPuestosControlHttp(codAduana : string): Observable<PuestoControl[]> {
    var url = this.URL_RESOURCE_PUESTOS_CONTROL + "/" + codAduana;

      if ( this.cachePuestoControl[codAduana] ) {
          return this.cachePuestoControl[codAduana];
      }

      this.cachePuestoControl[codAduana] = this.http.get<PuestoControl[]>(url).pipe(
          shareReplay({ bufferSize: 1, refCount: true }),
          catchError(err => {
            delete this.cachePuestoControl[codAduana];
            return EMPTY;
          })
      );

      return this.cachePuestoControl[codAduana];
  }




}
