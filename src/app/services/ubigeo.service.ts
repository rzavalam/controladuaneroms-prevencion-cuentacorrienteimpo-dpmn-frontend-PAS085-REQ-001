import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';

import { Respuesta } from '../model/common/Respuesta';
import { Ubigeo } from '../model/common/ubigeo.model';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { Estado } from '../model/common/Estado';
import { HttpClient } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';

@Injectable()
export class UbigeoService {

  private URL_RESOURCE_UBIGEOS : string;

  private rptUgigeos : Respuesta<Ubigeo[]> = Respuesta.create(null, Estado.LOADING);
  private rptUbigeosSource = new BehaviorSubject<Respuesta<Ubigeo[]>>(null);
  private cacheUbigeos : Observable<Ubigeo[]> ;

  public rptUgigeos$ = this.rptUbigeosSource.asObservable();

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_UBIGEOS = appEndPointConfig.ubigeo;
  }

  public obtenerUbigeos() : void {
    this.rptUbigeosSource.next(this.rptUgigeos);

    this.callHttpUbigeos().subscribe( ubigeos => {
      this.rptUgigeos = Respuesta.create(ubigeos, Estado.LOADING);
      this.rptUbigeosSource.next(this.rptUgigeos);
    });
  }

  public obtenerUgibeo(codUbigeo : string) : Ubigeo {
    return this.rptUgigeos?.data?.find( itUbigeo => itUbigeo.codUbigeo == codUbigeo);
  }

  public convertirToDataCatalogo(ubigeos : Ubigeo[]) : DataCatalogo[] {
    if ( ubigeos == null ) {
      return new Array();
    }

    var respuesta = new Array();
    var separador = " - ";
    ubigeos.forEach(itemUbigeo => {
        var dataCatalogo = new DataCatalogo();
        dataCatalogo.codDatacat = itemUbigeo.codUbigeo;
        var descripcion = "";

        dataCatalogo.desDataCat = descripcion.concat(itemUbigeo.nomDepartamento, separador,
                                                      itemUbigeo.nomProvincia, separador,
                                                      itemUbigeo.nomDistrito);
        respuesta.push(dataCatalogo);
    });

    return respuesta;
  }


  private callHttpUbigeos() : Observable<Ubigeo[]> {

    if ( this.cacheUbigeos ) {
      return this.cacheUbigeos;
    }

    this.cacheUbigeos = this.http.get<any[]>(this.URL_RESOURCE_UBIGEOS).pipe(
      map(res => {
        if ( res == null ) {
          return null;
        }
        var respuesta = new Array();

        res.forEach(itemRes => {
          var objUbigeo = new Ubigeo();
          objUbigeo.codUbigeo = itemRes?.codigo;
          objUbigeo.nomDepartamento = itemRes?.departamento;
          objUbigeo.nomProvincia = itemRes?.provincia;
          objUbigeo.nomDistrito = itemRes?.distrito;

          respuesta.push(objUbigeo);
        })

        return respuesta;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        delete this.cacheUbigeos;
        return EMPTY;
      })
    );

    return this.cacheUbigeos;
  }

}
