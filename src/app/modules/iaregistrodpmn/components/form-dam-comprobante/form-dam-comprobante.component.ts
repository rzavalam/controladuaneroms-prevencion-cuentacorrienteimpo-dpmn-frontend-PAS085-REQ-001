import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';

import { UbigeoService } from '../../../../services/ubigeo.service';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';
import { BuilderDpmnService } from '../../../../services/builder-dpmn.service';

import { RowTblCompago } from '../../../../model/bean/row-tbl-compago.model';

import { Respuesta } from 'src/app/model/common/Respuesta';
import { Ubigeo } from 'src/app/model/common/ubigeo.model';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';

import { DamSerieDpmn } from 'src/app/model/domain/dam-serie-dpmn.model';
import { Dpmn } from 'src/app/model/domain/dpmn.model';
import { GuiaRemision } from 'src/app/model/domain/guia-remision.model';
import { CartaPorte } from 'src/app/model/domain/carta-porte.model';

@Component({
  selector: 'app-form-dam-comprobante',
  templateUrl: './form-dam-comprobante.component.html',
  styleUrls: ['./form-dam-comprobante.component.css'],
  providers: [MessageService, BuilderDpmnService, ConfirmationService]
})
export class FormDamComprobanteComponent implements OnInit, AfterViewInit {

  private rptDataCatUbigeos : Respuesta<DataCatalogo[]> = Respuesta.create(null, null);
  private rptUbigeos : Respuesta<Ubigeo[]>;
  private dataDpmn : Dpmn;

  private rptUbigeosSubs : Subscription;
  private damSeriesDpmnSubs : Subscription;
  private dpmnSubs : Subscription;
  private msgNewDamSerieDpmnSubs : Subscription;

  observaciones: string;
  rowsTblComprobante : RowTblCompago[] = new Array();

  ubigeoSeleccionado: DataCatalogo;
  ubigeosFiltrados: DataCatalogo[];

  damSeriesDpmn : DamSerieDpmn[] = new Array();

  constructor(private ubigeoService : UbigeoService,
              private registroDpmnService : RegistroDpmnService,
              private messageService: MessageService,
              private builderDpmnService: BuilderDpmnService,
              private confirmationService: ConfirmationService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.ubigeoService.obtenerUbigeos();

    this.rptUbigeosSubs = this.ubigeoService.rptUgigeos$.subscribe((respuesta : Respuesta<Ubigeo[]>) => {
        this.rptUbigeos = respuesta;
        this.rptDataCatUbigeos.mensajes = respuesta.mensajes;
        this.rptDataCatUbigeos.data = this.ubigeoService.convertirToDataCatalogo(respuesta.data);
        this.rptDataCatUbigeos.estado = respuesta.estado;
    });

    this.damSeriesDpmnSubs = this.registroDpmnService.damSeriesDpmn$.subscribe(( respuesta : DamSerieDpmn[] ) => {
      this.damSeriesDpmn = respuesta;
    });

    this.dpmnSubs = this.registroDpmnService.dpmn$.subscribe((newDpmn : Dpmn) => {
        this.dataDpmn = newDpmn;
        this.observaciones = this.dataDpmn?.datoComplementario?.desObservacion;
        this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.dataDpmn?.datoComplementario?.ubigeoOrigen?.codUbigeo);
        this.completarDataTblComprobantes(newDpmn);
    });

    this.registroDpmnService.colocarPasoActual(2);

  }

  ngAfterViewInit() {
    this.msgNewDamSerieDpmnSubs = this.registroDpmnService.msgConfirmNewDamSerieDpmn$?.subscribe( ( respuesta : string ) => {

      if ( respuesta == null ) {
        return;
      }
      this.messageService.add({severity:"info", summary: 'Mensaje', detail: respuesta});

      this.registroDpmnService.limpiarMsgConfirmNewDamSeriesDpmn();
    });
  }

  private completarDataTblComprobantes(newDpmn : Dpmn) : void {

    this.rowsTblComprobante = new Array();

    if ( newDpmn == null ) {
      return;
    }

    if ( newDpmn.comprobantePago == null || newDpmn.comprobantePago.length <= 0 ) {
      return;
    }

    newDpmn.comprobantePago.forEach(itComprob => {

      let rowTblCompago : RowTblCompago = new RowTblCompago();

      rowTblCompago.correlativo = itComprob.numCorrelativo;
      rowTblCompago.destinatarioRazonSocial = itComprob.desRazonSocialDestinatario;
      rowTblCompago.destinatarioRuc = itComprob.numRucDestinatario;
      rowTblCompago.destino = itComprob.ubigeoDestino.nomDepartamento + "-" +
                              itComprob.ubigeoDestino.nomProvincia + "-" +
                              itComprob.ubigeoDestino.nomDistrito;
      rowTblCompago.motivoTraslado = itComprob.motivoDeTraslado.desDataCat;

      if ( itComprob instanceof GuiaRemision  ) {
        rowTblCompago.numero = itComprob.numSerie + "-" + itComprob.numGuia;
        rowTblCompago.remitenteRazonSocial = itComprob.desRazonSocialRemitente;
        rowTblCompago.remitenteRuc = itComprob.numRucRemitente;
      }

      if ( itComprob instanceof CartaPorte  ) {
        rowTblCompago.numero = itComprob.numCartaPorte;
        rowTblCompago.remitenteRuc = itComprob.nomEmpresa;
      }

      this.rowsTblComprobante.push(rowTblCompago);

    });

  }

  encontrarDatCatUbigeo(codUbigeo : string) : DataCatalogo {
    return this.rptDataCatUbigeos.data.find(( datCatUbigeo : DataCatalogo) => datCatUbigeo.codDatacat == codUbigeo);
  }

  filtrarUbigeo(event)  {
    let filtered: DataCatalogo[] = [];
    let query = event.query;
    for (let i = 0; i < this.rptDataCatUbigeos?.data?.length; i++) {
      let itemUbigeo = this.rptDataCatUbigeos.data[i];
      if (itemUbigeo.desDataCat.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(itemUbigeo);
      }
    }

    this.ubigeosFiltrados = filtered;
    this.verificarUbigeoExiste();
  }

  private verificarUbigeoExiste() : void {
    this.messageService.clear();
    let noHayUbigeos = this.ubigeosFiltrados == null  || this.ubigeosFiltrados.length <= 0;

    if ( noHayUbigeos ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Ciudad origen no existe'});
    }
  }

  irPaginaAnterior() : void {

    /*if ( this.faltaIngresarUbigeo() ) {
      return;
    }*/

    this.actualizarData();
    this.eliminarSubscripciones();
    this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
  }

  faltaIngresarUbigeo() : boolean {

    if ( this.ubigeoSeleccionado == null ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta seleccionar la ciudad de origen'});
      return true;
    }

    return false;
  }

  private faltaIngresarComprobantes() : boolean {
    let faltaIngresarComprobantes =  this.rowsTblComprobante.length <= 0;
    let faltaIngresarDamSeriesDpmn = this.damSeriesDpmn.length <= 0;

    let resultado = faltaIngresarComprobantes ||  faltaIngresarDamSeriesDpmn;

    if ( resultado ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Debe registrar por lo menos una serie de declaración y un comprobante de pago'});
    }

    return resultado;
  }

  irPageAddDeclaracion() {

    if ( this.faltaIngresarUbigeo() ) {
      return;
    }

    this.actualizarData();
    this.eliminarSubscripciones();
    this.router.navigate(['../add-declaracion'], { relativeTo: this.activatedRoute });
  }

  irPaginaSiguiente() {

    if ( this.faltaIngresarUbigeo() ) {
      return;
    }

    if ( this.faltaIngresarComprobantes() ) {
      return;
    }

    this.actualizarData();
    this.eliminarSubscripciones();
    this.router.navigate(['../adjuntar-archivos'], { relativeTo: this.activatedRoute });
  }

  eliminarComprobante(rowTblCompago : RowTblCompago)  : void {
    this.confirmationService.confirm({
        message: '&iquest;Desea retirar el Comprobante Pago/Carta Porte y sus declaraciones de importaci&oacute;n?',
        header: 'Retirar comprobante: ' + rowTblCompago.numero,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.registroDpmnService.eliminarComprobante(rowTblCompago.correlativo);
        }
    });
  }

  actualizarData() : void {
    this.builderDpmnService.iniciar(this.dataDpmn);
    this.builderDpmnService.setUbigeoOrigen(this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado?.codDatacat));
    this.builderDpmnService.setObservaciones(this.observaciones);
    this.registroDpmnService.putDpmn(this.builderDpmnService.resultado);
  }

  private eliminarSubscripciones() : void {
    this.rptUbigeosSubs.unsubscribe();
    this.damSeriesDpmnSubs.unsubscribe();
    this.dpmnSubs.unsubscribe();
    this.msgNewDamSerieDpmnSubs?.unsubscribe();
  }



}
