import { Inject, Injectable } from '@angular/core';

import {Dpmn} from '../model/domain/dpmn.model';
import {DamSerieDpmn} from '../model/domain/dam-serie-dpmn.model';
import {ArchivoDpmn} from '../model/bean/archivo-dpmn.model';
import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ConstantesApp } from '../utils/constantes-app';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {IdentificadorDpmn} from '../model/domain/identificador-dpmn.model'
import { catchError, concatMap, delay, flatMap, map, mergeMap, retryWhen, take, timestamp } from 'rxjs/operators';
import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { TokenAccesoService } from './token-acceso.service';
import { Auditoria } from '../model/domain/auditoria.model';
import { ParamBusqDcl } from '../model/bean/param-busq-dcl.model';
import { CheckDpmn } from '../model/bean/check-dpmn.model';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { PciDetalle } from '../model/bean/pci-detalle';
import { FuncionarioAduanero } from '../model/domain/funcionario-aduanero.model';

@Injectable()
export class RegistroDpmnService {

  private readonly maxIntentos : number = 10;
  private readonly urlDpmn : string;
  private readonly urlDamSeriesDpmn : string;
  private readonly urlAdjuntosDpmn : string;
  private readonly urlVerificarGrabacionDpmn : string;

  private identificadorDpmn : IdentificadorDpmn;

  private pasoActualSubject = new BehaviorSubject<number>(1);
  public pasoActual$ = this.pasoActualSubject.asObservable();

  private dpmn: Dpmn = new Dpmn();
  private dpmnSubject = new BehaviorSubject<Dpmn>(this.dpmn);
  public dpmn$ = this.dpmnSubject.asObservable();

  private damSeriesDpmn : DamSerieDpmn[] = new Array();
  private damSeriesDpmnSubject = new BehaviorSubject<DamSerieDpmn[]>(new Array());
  public damSeriesDpmn$ = this.damSeriesDpmnSubject.asObservable();

  private archivosDpmn: ArchivoDpmn[] = new Array();
  private archivosDpmnSubject = new BehaviorSubject<ArchivoDpmn[]>(this.archivosDpmn);
  public archivosDpmn$ = this.archivosDpmnSubject.asObservable();

  private resultadoGrabadoDpmn : Respuesta<IdentificadorDpmn> = null;
  private resultadoGrabadoDpmnSubject = new BehaviorSubject<Respuesta<IdentificadorDpmn>>(this.resultadoGrabadoDpmn);
  public  resultadoGrabadoDpmn$ = this.resultadoGrabadoDpmnSubject.asObservable();

  private msgConfirmNewDamSerieDpmnSubject = new BehaviorSubject<String>(null);
  public msgConfirmNewDamSerieDpmn$ = this.msgConfirmNewDamSerieDpmnSubject.asObservable();

  pciDetalle: PciDetalle;

  private appEndPointConfig: AppEndpointConfig;

  constructor(private http: HttpClient, private tokenAccesoService: TokenAccesoService,
                @Inject(APP_ENDPOINT_CONFIG) newAppEndPointConfig : AppEndpointConfig) {
      this.urlDpmn = newAppEndPointConfig.dpmn;
      this.urlDamSeriesDpmn = newAppEndPointConfig.damSeriesDpmn;
      this.urlAdjuntosDpmn = newAppEndPointConfig.adjuntosDpmn;
      this.urlVerificarGrabacionDpmn = newAppEndPointConfig.verificarGrabacionDpmn;

      this.appEndPointConfig = newAppEndPointConfig;
  }

  limpiarData() : void {
    this.dpmn = new  Dpmn();
    this.damSeriesDpmn = new Array();
    this.archivosDpmn = new Array();
    this.resultadoGrabadoDpmn = null;

    this.dpmnSubject.next(this.dpmn);
    this.damSeriesDpmnSubject.next(this.damSeriesDpmn);
    this.archivosDpmnSubject.next(this.archivosDpmn);
    this.resultadoGrabadoDpmnSubject.next(this.resultadoGrabadoDpmn);
  }

  putDpmn(newDpmn: Dpmn) : void {
    this.dpmn = newDpmn;
    this.dpmnSubject.next(this.dpmn);
  }

  putDamSeriesDpmn(correComprob : number, newDamSeriesDpmn : DamSerieDpmn[]) : void {

    if ( newDamSeriesDpmn == null ) {
      return;
    }

    var seriesParaAgregar = newDamSeriesDpmn.filter(itemDamSerieDpmn => itemDamSerieDpmn?.cntRetirada > 0 );

    let correSerie = this. obtenerCorreDamSerieDpmn();

    seriesParaAgregar.forEach(serieAdd => {
      serieAdd.numCorreCompDpmn = correComprob;
      serieAdd.numCorrelativo = correSerie;
      this.damSeriesDpmn.push(serieAdd);
      correSerie++;
    });

    this.damSeriesDpmnSubject.next(this.damSeriesDpmn);
    this.enviarMsgConfirmNewDamSeriesDpmn(seriesParaAgregar);
  }

  private enviarMsgConfirmNewDamSeriesDpmn(seriesParaAgregar : DamSerieDpmn[]) : void {

    let numSeries : string[] = new Array();
    let cantidades : string[] = new Array();

    seriesParaAgregar.forEach( ( item : DamSerieDpmn ) => {
      numSeries.push(item.numSerie.toString());
      cantidades.push(item.cntRetirada.toString());
    });

    let descSeries : string = numSeries.toString();
    descSeries = descSeries.replace(",", ", ");

    let desCantidades : string = cantidades.toString();
    desCantidades = desCantidades.replace(",", ", ");

    let mensaje : string = "Se agrega(n) serie(s) " + descSeries + " con " + desCantidades + " unidades físicas a descargar";

    this.msgConfirmNewDamSerieDpmnSubject.next(mensaje);
  }

  limpiarMsgConfirmNewDamSeriesDpmn() : void {
    this.msgConfirmNewDamSerieDpmnSubject.next(null);
  }

  eliminarComprobante(correComprob : number) : void {
    this.dpmn.comprobantePago = this.dpmn?.comprobantePago.filter((item : ComprobantePago) => item.numCorrelativo != correComprob );;
    this.damSeriesDpmn = this.damSeriesDpmn.filter( (item : DamSerieDpmn) => item.numCorreCompDpmn != correComprob  );

    this.dpmnSubject.next(this.dpmn);
    this.damSeriesDpmnSubject.next(this.damSeriesDpmn);
  }

  adjuntarArchivo(archivo: File, tipoDocumento: DataCatalogo) : void {

    let correArchivo = this.archivosDpmn.length + 1;

    let archivoDpmn = new ArchivoDpmn();
    archivoDpmn.id = correArchivo;
    archivoDpmn.codTipoDocumento = tipoDocumento.codDatacat;
    archivoDpmn.desTipoDocumento = tipoDocumento.desDataCat;
    archivoDpmn.nomArchivo = archivo.name;
    archivoDpmn.nomContentType = archivo.type;
    archivoDpmn.fechaRegistro = new Date();
    archivoDpmn.usuarioRegistra = this.tokenAccesoService.login;
    archivoDpmn.origenInvocacion = this.tokenAccesoService.origen;

    this.convertFile(archivo).subscribe((base64 : string) => {
      archivoDpmn.valArchivoBase64 = base64;
      this.archivosDpmn.push(archivoDpmn);
      this.archivosDpmnSubject.next(this.archivosDpmn);
    });
  }

  eliminarArchivo(idArchivo : number) : void {
    this.archivosDpmn = this.archivosDpmn.filter( ( item : ArchivoDpmn ) => item.id != idArchivo );
    this.archivosDpmnSubject.next(this.archivosDpmn);
  }

  private completarDpmnEnSeriesDAM(identificador: IdentificadorDpmn) {
      this.damSeriesDpmn.forEach((item : DamSerieDpmn) => {
        item.numCorreDpmn = identificador.correlativo;
      });
  }

  private completarDpmnEnAdjuntos(identificador: IdentificadorDpmn) {
    this.archivosDpmn.forEach((item : ArchivoDpmn) => {
      item.codAduanaDpmn = identificador.codAduana;
      item.annioDpmn = identificador.anio.toString();
      item.numeroDpmn = identificador.numero.toString();
      item.numCorrelativoDpmn = identificador.correlativo;
    });
}

  private requestGrabarSeriesConAdjuntos() : Observable<any>[] {
    let peticiones : Observable<any>[] = new Array();

    let bloqueDamSeriesDpmn = this.getBloquesDamSeriesDpmn(ConstantesApp.TAMANIO_BATCH_DAMSERIESDPMN_POR_REQUEST);

    bloqueDamSeriesDpmn.forEach((bloque : DamSerieDpmn[])=> {
      peticiones.push(this.http.post(this.urlDamSeriesDpmn, bloque));
    });

    this.archivosDpmn.forEach((archivo : ArchivoDpmn) => {
      peticiones.push(this.requestGrabarAdjunto(archivo));
    });

    return peticiones;
  }

  private requestGrabarAdjunto(archivo : ArchivoDpmn) : Observable<any> {
    return this.http.post(this.urlAdjuntosDpmn, archivo).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < 3) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );
  }

  private requestVerificarGrabacionDpmn() : Observable<any> {
    let checkDpmn : CheckDpmn = new CheckDpmn();

    checkDpmn.correlativoDpmn = this.identificadorDpmn.correlativo;
    checkDpmn.cntSeriesDcl = this.damSeriesDpmn.length;
    checkDpmn.cntArchivosAdjuntos = this.archivosDpmn.length;

    let request = this.http.post(this.urlVerificarGrabacionDpmn, checkDpmn).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < this.maxIntentos) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );

    return request;
  }

  private getBloquesDamSeriesDpmn(tamanio: number) : DamSerieDpmn[][] {

    var result : DamSerieDpmn[][] = this.damSeriesDpmn.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index/tamanio)

      if(!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, []);

    return result;
  }

  validarGrabacionDpmn() : string[] {
    let respuesta : string[] = new Array();

    if ( this.faltaIngresarDeclaracionComprobante() ) {
      respuesta.push("Debe ingresar por lo menos una serie de declaración de importación y un comprobantes de pago");
    }

    if ( this.noTieneArchivosAdjuntos() ) {
      respuesta.push("Debe adjuntar por lo menos un archivo");
    }

    if ( this.faltaIngresarPlacaCarreta() ) {
      respuesta.push("Falta ingresar la placa de la carreta o no debe ingresar el país placa carreta");
    }

    if ( this.faltaIngresarPaisPlacaCarreta() ) {
      respuesta.push("Falta ingresar el país de la placa carreta o no debe ingresar la placa carreta");
    }

    return respuesta;
  }

  ciudadOrigenIgual(codCiudadOrigen : string) : boolean {
    if ( codCiudadOrigen == null ) {
      return false;
    }

    let codigoCiudadOrigen = this.dpmn?.datoComplementario?.ubigeoOrigen?.codUbigeo;

    return codigoCiudadOrigen == codCiudadOrigen;
  }

  private noTieneArchivosAdjuntos() : boolean {
    return this.archivosDpmn == null || this.archivosDpmn.length <= 0;
  }

  private tienePaisPlacaCarreta() : boolean {
    let paisPlacaCarreta = this.dpmn?.empresaTransporte?.paisPlacaCarreta?.codDatacat;
    return paisPlacaCarreta != null && paisPlacaCarreta.trim().length > 0;
  }

  private tienePlacaCarreta() : boolean {
    let nomPlaca = this.dpmn?.empresaTransporte?.nomPlacaCarreta;
    return nomPlaca != null && nomPlaca.trim().length > 0;
  }

  private faltaIngresarPlacaCarreta() : boolean {
    return this.tienePaisPlacaCarreta() && !this.tienePlacaCarreta();
  }

  private faltaIngresarPaisPlacaCarreta() : boolean {
    return !this.tienePaisPlacaCarreta() && this.tienePlacaCarreta();
  }

  private faltaIngresarDeclaracionComprobante() : boolean {
      let numComprobantes = this.dpmn?.comprobantePago?.length;
      let noHayComprobantes =  numComprobantes == null || numComprobantes <= 0;

      let numDclSeriesDpmn = this.damSeriesDpmn?.length;
      let noHayDclSeriesDpmn = numDclSeriesDpmn == null || numDclSeriesDpmn <= 0;

      return noHayComprobantes || noHayDclSeriesDpmn;
  }

  private completarDatosAuditoria() : void {
    let auditoria : Auditoria = new Auditoria();
    let fechaActual : Date = new Date();

    auditoria.codUsuRegis =  this.tokenAccesoService.login;
    auditoria.fecRegis = fechaActual;
    auditoria.codUsumodif =  this.tokenAccesoService.login;
    auditoria.fecModif = fechaActual;

    this.dpmn.auditoria = auditoria;
    this.dpmn.fecDpmn = fechaActual;

    this.damSeriesDpmn.forEach( (item : DamSerieDpmn) => {
      item.auditoria = auditoria;
    });

  }

  private completarEstado() : void {
    let estadoDpmn : DataCatalogo = new  DataCatalogo();
    estadoDpmn.codDatacat = "01";
    estadoDpmn.desDataCat = "Registrada";

    this.dpmn.estado = estadoDpmn;
  }

  private completarActorRegistro() : void {
    let actorRegistro : DataCatalogo = new  DataCatalogo();

    let esInternet : boolean = this.tokenAccesoService.origen == ConstantesApp.ORIGEN_INTERNET;
    let esIntranet : boolean = this.tokenAccesoService.origen == ConstantesApp.ORIGEN_INTRANET;

    if ( esInternet ) {
      actorRegistro.codDatacat = "UE";
      actorRegistro.desDataCat = "Usuario externo";
    }

    if ( esIntranet ) {
      actorRegistro.codDatacat = "FA";
      actorRegistro.desDataCat = "Funcionario aduanero";
    }

    this.dpmn.actorRegistro = actorRegistro;
  }

  private completarVariableControl() : void {
    this.dpmn.codVariableControl = " ";
  }

  private completarTipoAnulacion() : void {
    let tipoAnulacion : DataCatalogo = new  DataCatalogo();
    tipoAnulacion.codDatacat = "";
    tipoAnulacion.desDataCat = "No Anulado";
    this.dpmn.tipoAnulacion = tipoAnulacion;
  }

  private evaluarCompletarControlPaso() : void {
    let esIntranet : boolean = this.tokenAccesoService.origen == ConstantesApp.ORIGEN_INTRANET;

    if ( esIntranet ) {
      this.dpmn.numCorrelativoPCI = this.pciDetalle.numCorrelativo;
    }

  }

  private evaluarCompletarFuncionarioAduanero(): void {
    let esIntranet : boolean = this.tokenAccesoService.origen == ConstantesApp.ORIGEN_INTRANET;

    if ( !esIntranet ) {
      return;
    }

    let funcionario : FuncionarioAduanero = new FuncionarioAduanero();
    funcionario.nroRegistro = this.tokenAccesoService.nroRegistro;
    funcionario.nombre = this.tokenAccesoService.nombreCompleto;

    this.dpmn.funcionarioAduanero = funcionario;
  }

  private completarDatosFaltantes() : void {
    this.completarDatosAuditoria();
    this.completarEstado();
    this.completarActorRegistro();
    this.completarVariableControl();
    this.completarTipoAnulacion();
    this.evaluarCompletarControlPaso();
    this.evaluarCompletarFuncionarioAduanero();
  }

  grabarDpmn() : void {
    this.resultadoGrabadoDpmn = Respuesta.create(null, Estado.LOADING);
    this.resultadoGrabadoDpmnSubject.next(this.resultadoGrabadoDpmn);

    this.completarDatosFaltantes();

    this.http.post<IdentificadorDpmn>(this.urlDpmn, this.dpmn).pipe(
        map( (respuesta: IdentificadorDpmn) => {
          this.identificadorDpmn = respuesta;
          return respuesta
        }),
        mergeMap(respuesta => {
            this.completarDpmnEnSeriesDAM(respuesta);
            this.completarDpmnEnAdjuntos(respuesta);
            return forkJoin(this.requestGrabarSeriesConAdjuntos());
        }, 5),
        concatMap( respuesta => this.requestVerificarGrabacionDpmn() ),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          this.resultadoGrabadoDpmn = Respuesta.create(this.identificadorDpmn, Estado.ERROR);
          this.resultadoGrabadoDpmnSubject.next(this.resultadoGrabadoDpmn);
          return throwError(error);
        })
    ).subscribe(resultado => {
        this.resultadoGrabadoDpmn = Respuesta.create(this.identificadorDpmn, Estado.SUCCESS);
        this.resultadoGrabadoDpmnSubject.next(this.resultadoGrabadoDpmn);
    });
  }

  colocarPasoActual(numeroPaso : number) : void {
    this.pasoActualSubject.next(numeroPaso);
  }

  private obtenerCorreDamSerieDpmn() : number {
    if ( this.damSeriesDpmn == null || this.damSeriesDpmn.length <= 0 ) {
      return 1;
    }

    return Math.max.apply(Math, this.damSeriesDpmn.map( (itDamSerieDpmn) => itDamSerieDpmn.numCorrelativo)) + 1;
  }

  private convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  declaracionEstaRegistrada(paramBusqDcl: ParamBusqDcl) : boolean {

    let damEncontrada : DamSerieDpmn = this.damSeriesDpmn.find( ( item : DamSerieDpmn) => {
      let mismaAduana : boolean = item.aduanaDam?.codDatacat ==  paramBusqDcl?.codAduana;
      let mismoRegimen : boolean = item.regimenDam?.codDatacat == paramBusqDcl?.codRegimen;
      let mismoNumero : boolean = item.numDam ==  Number.parseInt(paramBusqDcl?.numero);
      let mismoAnio : boolean = item.annDam ==  Number.parseInt(paramBusqDcl?.anio);

      return mismaAduana && mismoRegimen && mismoNumero && mismoAnio;
    });

    return damEncontrada != null;
  }

  descargarFicharResumen() : Observable<any> {
    let urlFichaQR = this.urlFichaResumenQr;
    return this.http.get(urlFichaQR, {responseType: 'blob' as 'json'});
  }

  get urlFichaResumenQr() : string {
    let correlativo = this.identificadorDpmn.correlativo;
    return this.appEndPointConfig.getFichaResumenQr(correlativo);
  }

  get numeroDpmnGenerado() : string {

    if ( this.identificadorDpmn == null ) {
      return null;
    }

    return this.identificadorDpmn?.codAduana + "-" +
            this.identificadorDpmn?.anio + "-" +
            this.identificadorDpmn?.numero;
  }

}
