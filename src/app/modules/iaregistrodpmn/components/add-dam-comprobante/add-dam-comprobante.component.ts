import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UbigeoService } from '../../../../services/ubigeo.service';
import { RucService } from '../../../../services/ruc.service';
import { ValDclRegistroDpmnService } from '../../../../services/val-dcl-registro-dpmn.service';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';
import { BuilderDpmnService } from '../../../../services/builder-dpmn.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { GuiaRemisionService } from '../../../../services/guia-remision.service';
import { DeclaracionService } from '../../../../services/declaracion.service';

import { Respuesta } from 'src/app/model/common/Respuesta';
import { Estado } from 'src/app/model/common/Estado';
import { Ubigeo } from 'src/app/model/common/ubigeo.model';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { TipoComprobante } from 'src/app/model/common/tipo-comprobante.enum';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { Canal }  from 'src/app/model/common/canal.enum';

import { DamSerieDpmn } from 'src/app/model/domain/dam-serie-dpmn.model';
import { ComprobantePago } from 'src/app/model/domain/comprobante-pago.model';
import { GuiaRemision } from 'src/app/model/domain/guia-remision.model';
import { CartaPorte } from 'src/app/model/domain/carta-porte.model';
import { Dpmn } from 'src/app/model/domain/dpmn.model';

import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { GuiaRemisionTransp } from 'src/app/model/bean/guia-remision-transp.model';

import { ConstantesApp } from 'src/app/utils/constantes-app';

import {MessageService} from 'primeng/api';
import { TipoNacionalidad } from 'src/app/model/common/tipo-nacionalidad.enum';
import { SaldoSerieDam } from 'src/app/model/bean/saldo-serie-dam';
import { Declaracion } from 'src/app/model/bean/declaracion';

@Component({
  selector: 'app-add-dam-comprobante',
  templateUrl: './add-dam-comprobante.component.html',
  styleUrls: ['./add-dam-comprobante.component.css'],
  providers: [MessageService, ValDclRegistroDpmnService, RucService, BuilderDpmnService, GuiaRemisionService]
})
export class AddDamComprobanteComponent implements OnInit {

  estado =  Estado;
  estadoValDcl = Estado;
  ubigeoSeleccionado: any;
  ubigeosFiltrados: any[];
  validarDeclaracionForm : FormGroup;
  addComprobanteForm : FormGroup;
  rptaDamSeriesDpmn : Respuesta<DamSerieDpmn[]>;
  rptaGuiaRemision  : Respuesta<GuiaRemisionTransp>;

  motivosTraslado: DataCatalogo[] = new Array();

  catalogoAduanas: DataCatalogo[] = new Array();

  constantesApp : ConstantesApp = ConstantesApp;
  esTranspExtranjero: boolean = false;

  rptaDeclaracion: Respuesta<Declaracion> = Respuesta.create(null, null);

  canal = Canal;
  colorCanal: string;

  private anioActual: number;

  private rucRemitente : Ruc;
  private rucDestinatario : Ruc;
  private rptDataCatUbigeos : Respuesta<DataCatalogo[]> = Respuesta.create(null, null);
  private numRucGuiaRemSubs : Subscription;
  private buscarGuiaRemisionSubs : Subscription;
  private nomCtrlsPorTipoComp : string[] = ["numSerieGuia", "numGuia", "numRucGuia", "razSocialGuia", "numCartaPorte", "empCartaPorte"];

  private patternBusqSeries : string = "^([0-9]+(-[0-9]+)?)(,([0-9]+(-[0-9]+)?))*$";

  private rptaSaldoSerieDam : Respuesta<SaldoSerieDam[]> = Respuesta.create(null, null);

  constructor(private valDclRegDpmService : ValDclRegistroDpmnService,
              private ubigeoService : UbigeoService,
              private messageService: MessageService,
              private router: Router,
              private registroDpmnService : RegistroDpmnService,
              private rucService : RucService,
              private builderDpmn : BuilderDpmnService,
              private activatedRoute: ActivatedRoute,
              private catalogoService: CatalogoService,
              private guiaRemisionService: GuiaRemisionService,
              private declaracionService: DeclaracionService,
              private formBuilder: FormBuilder ) { }

  ngOnInit(): void {
    this.buildForm();
    this.anioActual = new Date().getFullYear();

    this.frmCtrlDclAnio.setValue(this.anioActual);

    this.catalogoService.cargarDesdeJson("assets/json/motivo-traslado.json").subscribe((resultado : DataCatalogo[])=> {
      this.motivosTraslado = resultado;
      this.frmCtrlMotivoTraslado.setValue("11");
    });

    //assets/json/aduanas-busq-dam.json
    this.catalogoService.cargarDesdeJson("assets/json/aduanas-busq-dam.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoAduanas = resultado;
    });

    this.ubigeoService.obtenerUbigeos();

    this.ubigeoService.rptUgigeos$.subscribe((respuesta : Respuesta<Ubigeo[]>) => {
      this.rptDataCatUbigeos.mensajes = respuesta.mensajes;
      this.rptDataCatUbigeos.data = this.ubigeoService.convertirToDataCatalogo(respuesta.data);
      this.rptDataCatUbigeos.estado = respuesta.estado;
    });

    this.valDclRegDpmService.rptaBusqDcl$.subscribe((resultado : Respuesta<DamSerieDpmn[]>) => {
        this.rptaDamSeriesDpmn = resultado;
        this.evalMostrarMsgError();
        this.filtrarSeriesBuscadas();
    });

    this.frmCtrlTipoComprobante.valueChanges.subscribe((value: string) => {
        if ( value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION ) {
          this.buildCtrlsGuiaRemision();
          this.iniSubsCtrlsGuiaRemision();
        }

        if ( value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE ) {
          this.buildCtrlsCartaPorte();
        }
    });

    this.frmCtrlRucDestinatario.valueChanges.subscribe((valor: string) => {

      this.rucDestinatario = null;

      if ( valor == null  ) {
        return;
      }

      if ( valor.length != 11 ) {
        this.frmCtrlRazonSocialDestinatario.setValue("");
        return;
      }

      this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

        if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
          this.showMsgErrorCondicionEstadoRuc();
          this.frmCtrlRazonSocialDestinatario.setValue("");
          return;
        }

        this.rucDestinatario = objRuc;
        this.frmCtrlRazonSocialDestinatario.setValue(objRuc.razonSocial);
      }, () => {
        this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Numero de RUC no existe'});
      } );

    });

    this.registroDpmnService.dpmn$.subscribe(dataDpmn => {
      this.frmCtrlDclAduana.setValue(dataDpmn?.aduanaDescarga?.codDatacat);
      this.frmCtrlDclRegimen.setValue("10");
      this.esTranspExtranjero = dataDpmn?.empresaTransporte?.tipoNacionalidad?.codDatacat == TipoNacionalidad.EXTRANJERO;
      this.builderDpmn.iniciar(dataDpmn);
    });

    this.frmCtrlTipoComprobante.setValue(ConstantesApp.COD_TIPO_COMP_GUIA_REMISION);
    this.frmCtrlMotivoTraslado.setValue("11");
  }

  validarDeclaracion() : void {

    if (this.validarDeclaracionForm.invalid) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Debe completar correctamente los datos de la DAM'});
        return;
    }

    let anioDam : number = this.frmCtrlDclAnio.value;

    if ( anioDam > this.anioActual ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Año de la DAM no puede ser mayor al año actual'});
        return;
    }

    if ( this.frmCtrlDclAduana.value == "181" ) {
      this.frmCtrlDclAduana.setValue("262");
    }

    let paramBusqDcl = new ParamBusqDcl();

    paramBusqDcl.codAduana = this.frmCtrlDclAduana.value;
    paramBusqDcl.anio = this.frmCtrlDclAnio.value;
    paramBusqDcl.codRegimen = this.frmCtrlDclRegimen.value;
    paramBusqDcl.numero = this.frmCtrlDclNumero.value;

    if ( this.registroDpmnService.declaracionEstaRegistrada(paramBusqDcl) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Declaración ya cuenta con cantidades a descargar'});
        return;
    }

    this.valDclRegDpmService.buscarDeclaracionConSaldos(paramBusqDcl);
    this.mostrarDatosDam(paramBusqDcl);
  }

  descargarSaldoTotal() : void {
    let noHayData : boolean = ! (this.rptaDamSeriesDpmn?.data?.length > 0);

    if ( noHayData ) {
      return;
    }

    let damSeriesDpmn :  DamSerieDpmn[] = this.rptaDamSeriesDpmn.data;

    damSeriesDpmn.forEach( item => {
      if ( item.cntSaldo != null ) {
        item.cntRetirada = item.cntSaldo;
      } else {
        item.cntRetirada = item.cntUnidadFisica;
      }
    });
  }

  evalMostrarMsgError() : void {
    if ( this.rptaDamSeriesDpmn == null ) {
      return;
    }

    if ( this.rptaDamSeriesDpmn.mensajes == null ) {
      return;
    }

    if ( this.rptaDamSeriesDpmn.mensajes.length <= 0 ) {
      return;
    }

    var tipoSeverity = "info";

    if ( this.rptaDamSeriesDpmn.estado == Estado.ERROR ) {
      tipoSeverity = "error";
    }

    if ( this.rptaDamSeriesDpmn.estado == Estado.WARNING ) {
      tipoSeverity = "warn";
    }

    this.rptaDamSeriesDpmn.mensajes.forEach(mensajeBean => {
      this.messageService.clear();
      this.messageService.add({severity:tipoSeverity, summary: 'Mensaje', detail: mensajeBean.msg});
    });

  }

  get frmCtrlDclAduana(): AbstractControl {
    return this.validarDeclaracionForm.get('aduana') as FormControl;
  }

  get frmCtrlDclAnio(): AbstractControl {
    return this.validarDeclaracionForm.get('annio') as FormControl;
  }

  get frmCtrlDclRegimen(): AbstractControl {
    return this.validarDeclaracionForm.get('regimen') as FormControl;
  }

  get frmCtrlDclNumero(): AbstractControl {
    return this.validarDeclaracionForm.get('numero') as FormControl;
  }

  get frmCtrlDclSeries(): AbstractControl {
    return this.validarDeclaracionForm.get('series') as FormControl;
  }

  get frmCtrlTipoComprobante() : AbstractControl {
    return this.addComprobanteForm.get('tipoComprobante') as FormControl;
  }

  get frmCtrlNumSerieGuia() : AbstractControl {
    return this.addComprobanteForm.get('numSerieGuia') as FormControl;
  }

  get frmCtrlNumGuia() : AbstractControl {
    return this.addComprobanteForm.get('numGuia') as FormControl;
  }

  get frmCtrlNumRucGuia() : AbstractControl {
    return this.addComprobanteForm.get('numRucGuia') as FormControl;
  }

  get frmCtrlRazSocialGuia() : AbstractControl {
    return this.addComprobanteForm.get('razSocialGuia') as FormControl;
  }

  get frmCtrlMotivoTraslado() : AbstractControl {
    return this.addComprobanteForm.get('motivoTraslado') as FormControl;
  }

  get frmCtrlRucDestinatario() : AbstractControl {
    return this.addComprobanteForm.get('rucDestinatario') as FormControl;
  }

  get frmCtrlRazonSocialDestinatario() : AbstractControl {
    return this.addComprobanteForm.get('razonSocialDestinatario') as FormControl;
  }

  get frmCtrlNumCartaPorte() : AbstractControl {
    return this.addComprobanteForm.get('numCartaPorte') as FormControl;
  }

  get frmCtrlEmpCartaPorte() : AbstractControl {
    return this.addComprobanteForm.get('empCartaPorte') as FormControl;
  }

  filtrarUbigeo(event)  {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.rptDataCatUbigeos?.data?.length; i++) {
      let itemUbigeo = this.rptDataCatUbigeos.data[i];
      if (itemUbigeo.desDataCat.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(itemUbigeo);
      }
    }

    this.ubigeosFiltrados = filtered;
  }

  irPageComprobantes() {
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  private noSePuedeAddComprob() : boolean {
    if ( !this.valDclRegDpmService.haySerieConRetiro(this.rptaDamSeriesDpmn.data) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Debe colocar la cantidad a retirar en por lo menos una serie'});
      return true;
    }

    let faltaCompletarFormComp = !this.addComprobanteForm.valid;

    if ( faltaCompletarFormComp ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Falta completar información del comprobante'});
      return true;
    }

    if ( this.ubigeoSeleccionado == null ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Falta ingresar el destino'});
      return true;
    }

    if ( this.esDestinoNoValido() )  {
      return true;
    }

    return false;
  }

  addDclComprobantes() : void {

    if ( this.addComprobanteForm.invalid ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Falta completar los datos del Comprobante de pago / Carta porte'});
      return;
    }

    if ( this.noSePuedeAddComprob() ) {
      return;
    }

    let esGuiaRemision = this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION;

    if ( esGuiaRemision ) {
      this.validarExistenciaGuiaRemision();
      return;
    }

    this.agregarComprobanteDeclaracion();
  }

  private agregarComprobanteDeclaracion() : void {
    let comprobanteNew : ComprobantePago = this.crearComprobante();

    this.builderDpmn.addComprobantePago(comprobanteNew);
    var dpmnActualizada : Dpmn = this.builderDpmn.resultado;
    this.registroDpmnService.putDpmn(dpmnActualizada);
    this.registroDpmnService.putDamSeriesDpmn(comprobanteNew.numCorrelativo, this.rptaDamSeriesDpmn.data);
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }


  private crearComprobante() : ComprobantePago {
      if ( this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION ) {
        return this.crearGuiaRemision();
      } else if ( this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE ) {
        return this.crearCartaPorte()
      }

      return null;
  }

  private completarDatosComprobante(comprobante : ComprobantePago) : void {
    comprobante.motivoDeTraslado = this.motivosTraslado.find( ( motivo : DataCatalogo ) => motivo.codDatacat == this.frmCtrlMotivoTraslado.value );
    comprobante.numRucDestinatario = this.rucDestinatario.numero;
    comprobante.desRazonSocialDestinatario = this.rucDestinatario.razonSocial;
    comprobante.ubigeoDestino = this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado.codDatacat);
  }

  private crearGuiaRemision() : GuiaRemision {

    var guiaRemision : GuiaRemision = new GuiaRemision();
    guiaRemision.type = TipoComprobante.GUIA_REMISION;
    guiaRemision.tipoComprobante = new DataCatalogo();
    guiaRemision.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_GUIA_REMISION;
    guiaRemision.tipoComprobante.desDataCat = "Guia de remisión del remitente";

    guiaRemision.numSerie = this.frmCtrlNumSerieGuia.value;
    guiaRemision.numGuia = this.frmCtrlNumGuia.value;
    guiaRemision.numRucRemitente = this.rucRemitente.numero;
    guiaRemision.desRazonSocialRemitente = this.rucRemitente.razonSocial;

    this.completarDatosComprobante(guiaRemision);

    return guiaRemision;
  }

  private crearCartaPorte() : CartaPorte {

    let cartaPorte : CartaPorte = new CartaPorte();
    cartaPorte.type = TipoComprobante.CARTA_PORTE;
    cartaPorte.tipoComprobante = new DataCatalogo();
    cartaPorte.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_CARTA_PORTE;
    cartaPorte.tipoComprobante.desDataCat = "Carta porte";

    cartaPorte.numCartaPorte = this.frmCtrlNumCartaPorte.value;
    cartaPorte.nomEmpresa = this.frmCtrlEmpCartaPorte.value;

    this.completarDatosComprobante(cartaPorte);

    return cartaPorte;
  }

  private buildCtrlsGuiaRemision() : void {
      this.cleanCtrlPorTipoComprob();
      this.addComprobanteForm.addControl("numSerieGuia", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("numGuia", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("numRucGuia", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("razSocialGuia", new FormControl('', [Validators.required]));
  }

  private buildCtrlsCartaPorte() : void {
    this.cleanCtrlPorTipoComprob();
    this.addComprobanteForm.addControl("numCartaPorte", new FormControl('', [Validators.required]));
    this.addComprobanteForm.addControl("empCartaPorte", new FormControl('', [Validators.minLength(3), Validators.required]));
  }

  private cleanCtrlPorTipoComprob() : void {
    this.nomCtrlsPorTipoComp.forEach(nombre => {
      if ( this.addComprobanteForm.contains(nombre) ) {
        this.addComprobanteForm.removeControl(nombre);
      }
    });
  }

  private iniSubsCtrlsGuiaRemision() : void {

    if ( this.numRucGuiaRemSubs != null ) {
      this.numRucGuiaRemSubs.unsubscribe();
    }

    if ( this.buscarGuiaRemisionSubs != null ) {
      this.buscarGuiaRemisionSubs.unsubscribe();
    }

    this.buscarGuiaRemisionSubs = this.guiaRemisionService.rptaGuiaRemision$.subscribe((rpta : Respuesta<GuiaRemisionTransp>) => {

      this.rptaGuiaRemision = rpta;

      if ( rpta == null ) {
        return;
      }

      if ( rpta.estado === Estado.LOADING ) {
        return;
      }

      let isbusqNoExitosa = rpta.estado != Estado.SUCCESS;

      if ( isbusqNoExitosa ) {
        this.mostrarMsgGuiaRemisionNoExiste();
        return;
      }

      let noExisteGuiaRemision = rpta.data?.respuesta != '01';

      if ( noExisteGuiaRemision ) {
        this.mostrarMsgGuiaRemisionNoExiste();
        return
      }

      this.agregarComprobanteDeclaracion();

    });

    this.numRucGuiaRemSubs = this.frmCtrlNumRucGuia.valueChanges.subscribe((valor : string) => {

      if ( valor == null  ) {
        return;
      }

      if ( valor.length != 11 ) {
        this.frmCtrlRazSocialGuia.setValue("");
        return;
      }

      this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

        if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
          this.showMsgErrorCondicionEstadoRuc();
          this.frmCtrlRazSocialGuia.setValue("");
          return;
        }

        this.rucRemitente = objRuc;
        this.frmCtrlRazSocialGuia.setValue(objRuc.razonSocial);

      }, () => {
        this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Numero de RUC no existe'});
      } );

    });
  }

  private validarCondicionEstadoRuc(ruc : Ruc) : void {
    if ( this.esNoValidoCondicionEstadoRuc(ruc) ) {
      this.showMsgErrorCondicionEstadoRuc();
    }
  }

  private showMsgErrorCondicionEstadoRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: 'Número de RUC no se encuentra Activo o tiene la condición de No habido o No hallado'});
  }

  private esNoValidoCondicionEstadoRuc(ruc : Ruc) : boolean {

    if ( ruc == null ) {
      return false;
    }

    let esNoHabidoOrNoHallado : boolean = this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HABIDO) ||
                                          this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HALLADO);

    let esNoActivo : boolean = !this.rucService.tieneEstado(ruc, EstadoRuc.ACTIVO);

    return  esNoHabidoOrNoHallado || esNoActivo;
  }

  private obtenerSeriesSolicitadas() : number[] {
    let resultado : number[] = new Array();
    let seriesBuscadas : string = this.frmCtrlDclSeries.value;

    if ( seriesBuscadas == null || seriesBuscadas.trim().length <= 0 ) {
      return resultado;
    }

    let maxSigNumSerie = Math.max.apply(Math, this.rptaDamSeriesDpmn?.data?.map( (itDamSerieDpmn) => itDamSerieDpmn.numSerie)) + 1;

    seriesBuscadas = seriesBuscadas.replace(" ", "");

    resultado = seriesBuscadas.split(",")
    .reduce((a, str) => {
      if (!str.includes("-")) {
        a.push(Number(str));
        return a;
      }
      const [low, high] = str.split("-");

      let nLow = Number(low);
      let nHight = Number(high);

      let valMin = nLow;
      let valMax = nHight;

      if (nHight < nLow) {
        valMin = nHight;
        valMax = nLow;
      }

      if ( valMax > maxSigNumSerie ) {
        valMax = maxSigNumSerie;
      }

      for (let i = Number(valMin); i <= Number(valMax); i++) {
        a.push(i);
      }
      return a;
    }, []);

    resultado = resultado.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    });

    return resultado.sort((n1,n2) => n1 - n2);
  }

  validarCantidadRetirada( seriedpm : DamSerieDpmn ): void {
    if ( seriedpm.cntRetirada == null || seriedpm.cntRetirada <= 0 ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad a retirar debe ser mayor a cero (0)'});
      seriedpm.cntRetirada = 0;
      return;
    }

    let regexNumero : RegExp = /^(?:\d{1,17}\.\d{1,3})$|^\d{1,17}$/;

    let isCntRetiradaNoValido = !seriedpm.cntRetirada.toString().match(regexNumero);

    if ( isCntRetiradaNoValido ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad a retirar debe ser un campo numérico de máximo 17 enteros y 3 decimales'});
      seriedpm.cntRetirada = 0;
      return;
    }

    let noHaySaldo : boolean = seriedpm.cntSaldo === 0;
    let excedeSaldo : boolean =  seriedpm.cntSaldo != null && seriedpm.cntRetirada > seriedpm.cntSaldo;
    let seRetiraDeMas = seriedpm.cntRetirada >  seriedpm.cntUnidadFisica;

    if ( noHaySaldo ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'No existe saldo para la serie N° ' + seriedpm.numSerie});
      seriedpm.cntRetirada = 0;
      return;
    }

    if ( excedeSaldo ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad ingresada excede el saldo disponible'});
      seriedpm.cntRetirada = 0;
    }

    if ( seRetiraDeMas ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad ingresada excede la cantidad de la serie de la DAM'});
      seriedpm.cntRetirada = 0;
      return;
    }
  }

  private esDestinoNoValido() : boolean {
    let mismaCiudad : boolean = this.registroDpmnService.ciudadOrigenIgual(this.ubigeoSeleccionado?.codDatacat);

    if ( mismaCiudad ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Ciudad origen y destino no pueden ser la misma'});

      return true;
    }

    return false;
  }

  private mostrarMsgGuiaRemisionNoExiste() {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Guía de remisión ingresada no existe'});
  }

  private validarExistenciaGuiaRemision() {

    let numRuc : string = this.frmCtrlNumRucGuia.value;
    let numSerieGuia : string = this.frmCtrlNumSerieGuia.value;
    let numGuia : string = this.frmCtrlNumGuia.value;

    this.guiaRemisionService.buscar(numRuc, numSerieGuia, numGuia);
  }

  private filtrarSeriesBuscadas() : void {

    let numSeriesParaBusq : number[] = this.obtenerSeriesSolicitadas();

    let noHayQueFiltrarSeries = !( this.rptaDamSeriesDpmn?.estado == Estado.SUCCESS &&
                                      this.rptaDamSeriesDpmn?.data?.length > 0 && numSeriesParaBusq.length > 0 );

    if (noHayQueFiltrarSeries) {
      return;
    }

    let numSeriesDam : number[] = new Array();
    this.rptaDamSeriesDpmn.data.forEach((item: DamSerieDpmn) => numSeriesDam.push(item.numSerie));

    let seriesNoEncontradas : number[] = numSeriesParaBusq.filter(item => numSeriesDam.indexOf(item) < 0);
    let noSeHanEncontradoAlgunasSeries = seriesNoEncontradas?.length > 0;

    if ( noSeHanEncontradoAlgunasSeries ) {
      this.rptaDamSeriesDpmn.data = null;
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Número(s) /rango de series no existe en la declaración'});
      return;
    }

    let damSeriesFiltradas : DamSerieDpmn[] = new Array();

    numSeriesParaBusq.forEach( (numSerieParaBusq : number) => {
      let damSerieBusq : DamSerieDpmn = this.rptaDamSeriesDpmn.data.find( ( damSerieDpmn : DamSerieDpmn ) => damSerieDpmn.numSerie == numSerieParaBusq );
      damSeriesFiltradas.push(damSerieBusq);
    });

    this.rptaDamSeriesDpmn.data = damSeriesFiltradas;
  }

  private mostrarDatosDam(paramBusqDcl : ParamBusqDcl) : void {
    let codAduana: string = paramBusqDcl.codAduana;
    let anio: number = Number(paramBusqDcl.anio);
    let codRegimen : string = paramBusqDcl.codRegimen;
    let numero : number = Number(paramBusqDcl.numero);

    this.rptaDeclaracion = Respuesta.create(null, Estado.LOADING);
    this.colorCanal = null;

    this.declaracionService.buscar(codAduana, codRegimen, anio, numero).subscribe((declaracion : Declaracion) => {
      this.rptaDeclaracion = Respuesta.create(declaracion, Estado.SUCCESS);
      this.colorCanal = ConstantesApp.COLOR_CANAL.get(this.rptaDeclaracion?.data?.canal?.codigo);
    }, () => {
      this.rptaDeclaracion = Respuesta.create(null, Estado.SUCCESS);
    });
  }

  private buildForm() {
    this.validarDeclaracionForm = this.formBuilder.group({
        aduana : ['', [Validators.required]],
        annio : ['', [Validators.required]],
        regimen : ['', [Validators.required]],
        numero : ['', [Validators.required]],
        series : ['', [Validators.pattern(this.patternBusqSeries)]]
    });

    this.addComprobanteForm = this.formBuilder.group({
      tipoComprobante : ['', [Validators.required]],
      motivoTraslado :  ['', [Validators.required]],
      rucDestinatario : ['', [Validators.required]],
      razonSocialDestinatario : ['', [Validators.required]]
    });
  }

}
