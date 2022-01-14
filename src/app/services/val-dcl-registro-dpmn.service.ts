import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';

import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ParamBusqDcl } from '../model/bean/param-busq-dcl.model';
import { DamSerieDpmn } from '../model/domain/dam-serie-dpmn.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { SaldoSerieDam } from '../model/bean/saldo-serie-dam';

@Injectable()
export class ValDclRegistroDpmnService {

  private URL_RESOURCE_VAL_REGISTRO_DPMN : string;

  private rptaBusqDclSource = new BehaviorSubject<Respuesta<DamSerieDpmn[]>>(null);

  public rptaBusqDcl$ = this.rptaBusqDclSource.asObservable();

  constructor(private http: HttpClient, @Inject(APP_ENDPOINT_CONFIG) private appEndPointConfig : AppEndpointConfig) {
    this.URL_RESOURCE_VAL_REGISTRO_DPMN = appEndPointConfig.validarDamRegistroDpmn;
  }

  buscarDeclaracion( paramBusqDcl : ParamBusqDcl ) : void {
    this.rptaBusqDclSource.next(Respuesta.create(null, Estado.LOADING));

    this.validarDeclaracionHttp(paramBusqDcl).subscribe((respuesta : Respuesta<DamSerieDpmn[]>) => {
      this.rptaBusqDclSource.next(respuesta);
    });

  };

  buscarDeclaracionConSaldos( paramBusqDcl : ParamBusqDcl ) : void {
    this.rptaBusqDclSource.next(Respuesta.create(null, Estado.LOADING));

    this.validarDeclaracionHttp(paramBusqDcl).subscribe((respuesta : Respuesta<DamSerieDpmn[]>) => {

      let noEsRptaExitosa : boolean = respuesta.estado != Estado.SUCCESS;

        if ( noEsRptaExitosa ) {
          this.rptaBusqDclSource.next(respuesta);
          return;
        }

        //this.completarDefaultSaldos(respuesta);
        this.cargarSaldosCtaCteRptaDamSerieDpmn(paramBusqDcl, respuesta);
    });

  };

  private completarDefaultSaldos( rptaDataSeriesDpmn : Respuesta<DamSerieDpmn[]> ) : void {
    rptaDataSeriesDpmn?.data.forEach( ( damSerieDpmn : DamSerieDpmn ) => {
      damSerieDpmn.cntSaldo = damSerieDpmn.cntUnidadFisica;
      damSerieDpmn.numSecDescarga = 0;
    });
  }

  private cargarSaldosCtaCteRptaDamSerieDpmn(paramBusqDcl: ParamBusqDcl,
                                              rptaDataSeriesDpmn : Respuesta<DamSerieDpmn[]>) : void {

    let codAduana: string = paramBusqDcl.codAduana;
    let anio: number = Number(paramBusqDcl.anio);
    let codRegimen : string = paramBusqDcl.codRegimen;
    let numero : number = Number(paramBusqDcl.numero);

    let url : string = this.appEndPointConfig.getSaldoCtaCorrienteDam(codAduana, codRegimen, anio, numero);

    this.http.get<SaldoSerieDam[]>(url).subscribe( ( lstSaldoSerieDam : SaldoSerieDam[] ) => {
      let noHaySaldos : boolean = lstSaldoSerieDam == null || lstSaldoSerieDam.length <= 0;

      if ( noHaySaldos ) {
        this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
        return;
      }

      this.completarSaldoCtaCorriente(rptaDataSeriesDpmn, lstSaldoSerieDam);
      this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
    }, () => {
      this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
    });

  }

  private completarSaldoCtaCorriente(rptaDataSeriesDpmn : Respuesta<DamSerieDpmn[]>,
                                      lstSaldoSerieDam : SaldoSerieDam[]) : void {

      rptaDataSeriesDpmn?.data.forEach( ( damSerieDpmn : DamSerieDpmn ) => {

        let saldoSerieDam : SaldoSerieDam = this.lookupSaldoCtaCorriente(damSerieDpmn, lstSaldoSerieDam);

        if ( saldoSerieDam == null ) {
        return;
        }

        damSerieDpmn.cntSaldo = saldoSerieDam.cntSaldo;
        damSerieDpmn.numSecDescarga = saldoSerieDam.numSecDescarga;

      });
  }

  private lookupSaldoCtaCorriente( damSerieDpmn : DamSerieDpmn, lstSaldoSerieDam : SaldoSerieDam[] ) : SaldoSerieDam {

    if ( lstSaldoSerieDam == null || lstSaldoSerieDam.length <= 0 ) {
      return;
    }

    return lstSaldoSerieDam.find( ( saldo : SaldoSerieDam ) => saldo.numSerie === damSerieDpmn.numSerie );
  }

  private validarDeclaracionHttp( paramBusqDcl : ParamBusqDcl ): Observable<Respuesta<DamSerieDpmn[]>> {
    return this.http.post<any>(this.URL_RESOURCE_VAL_REGISTRO_DPMN, paramBusqDcl).pipe(
          map(dam => {

            if ( dam == null ) {
              return Respuesta.create(null, Estado.SUCCESS);
            }

            var lstDamSeriesDpmn : DamSerieDpmn[]  = new Array();

            dam?.series?.forEach(itemSerie => {

              var damSerieDpmn = new DamSerieDpmn();
              damSerieDpmn.aduanaDam = new DataCatalogo();
              damSerieDpmn.aduanaDam.codDatacat = dam.codAduana;

              damSerieDpmn.regimenDam = new DataCatalogo();
              damSerieDpmn.regimenDam.codDatacat = dam.codRegimen;
              damSerieDpmn.annDam = dam?.anio;
              damSerieDpmn.numDam = dam?.numero;

              damSerieDpmn.numSerie = itemSerie?.numSerie;
              damSerieDpmn.codSubPartida = itemSerie?.subpartida;
              damSerieDpmn.desComercial = itemSerie?.descripcion;
              damSerieDpmn.mtoPesoBruto = itemSerie?.pesoBruto;
              damSerieDpmn.mtoPesoNeto = itemSerie?.pesoNeto;
              damSerieDpmn.unidadFisica = new DataCatalogo();
              damSerieDpmn.unidadFisica.codDatacat = itemSerie?.codUnidFisica;
              damSerieDpmn.cntUnidadFisica = itemSerie?.cntDeclarada;
              damSerieDpmn.cntRetirada = 0;
              damSerieDpmn.indEliminado = false;

              lstDamSeriesDpmn.push(damSerieDpmn);

            });

        return Respuesta.create(lstDamSeriesDpmn, Estado.SUCCESS);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaBusqDclSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    );
  }

  haySerieSinRetirar(dataSeriesDpmn : DamSerieDpmn[]) : boolean {
    let serieDpmnSinRetirar = dataSeriesDpmn?.find(obj => obj.cntRetirada == null ||  obj.cntRetirada <= 0 );
    return serieDpmnSinRetirar != null;
  }

  haySerieConRetiro(dataSeriesDpmn : DamSerieDpmn[]) : boolean {
    let serieDpmnSinRetirar = dataSeriesDpmn?.find(obj => obj?.cntRetirada > 0 );
    return serieDpmnSinRetirar != null;
  }

  private getClaveCache(paramBusqDcl : ParamBusqDcl) : string {
    let clave = "";
    let separador = "-";
    clave.concat( paramBusqDcl.codAduana, separador,
                  paramBusqDcl.anio, separador,
                  paramBusqDcl.codRegimen, separador,
                  paramBusqDcl.numero );

    return clave;
  }

}
