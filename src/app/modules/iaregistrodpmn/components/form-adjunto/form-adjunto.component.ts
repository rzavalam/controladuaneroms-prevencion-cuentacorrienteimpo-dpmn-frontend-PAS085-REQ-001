import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CatalogoService } from '../../../../services/catalogo.service';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';

import {ConfirmationService} from 'primeng/api';
import {MessageService} from 'primeng/api';

import { ArchivoDpmn } from 'src/app/model/bean/archivo-dpmn.model';

import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { Estado } from 'src/app/model/common/Estado';

import { IdentificadorDpmn } from 'src/app/model/domain/identificador-dpmn.model';

import { ConstantesApp } from 'src/app/utils/constantes-app';

@Component({
  selector: 'app-form-adjunto',
  templateUrl: './form-adjunto.component.html',
  styleUrls: ['./form-adjunto.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class FormAdjuntoComponent implements OnInit {

  catalogoTipoDocAdjuntos: DataCatalogo[] = new Array();
  adjuntosForm: FormGroup;

  archivo: File;

  archivosDpmn : ArchivoDpmn[] = new Array();
  cargandoArchivo : boolean = false;

  mostrarDlgGuardarDpmn: boolean = false;

  rptaGrabarDpmn : Respuesta<IdentificadorDpmn>;
  estado = Estado;

  generandoQR: boolean = false;

  private archivosDpmnSubs : Subscription;
  private grabadoDpmnSubs : Subscription;

  @ViewChild('inputArchivo')
  inputArchivoRef: ElementRef;

  constructor(  private formBuilder: FormBuilder,
                private registroDpmnService: RegistroDpmnService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,
                private renderer: Renderer2,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private catalogoService : CatalogoService  ) { }

  ngOnInit(): void {
    this.catalogoService.cargarDesdeJson("assets/json/adjuntos-registrodpmn.json").subscribe((resultado : DataCatalogo[])=> this.catalogoTipoDocAdjuntos = resultado);
    this.buildForm();

    this.archivosDpmnSubs = this.registroDpmnService.archivosDpmn$.subscribe( ( respuesta : ArchivoDpmn[] ) => {
        this.archivosDpmn = [...respuesta];
        this.cargandoArchivo = false;
    });

    this.grabadoDpmnSubs = this.registroDpmnService.resultadoGrabadoDpmn$.subscribe( (respuesta : Respuesta<IdentificadorDpmn>) => {
      this.verificarEstadoGrabacion(respuesta);
    } );

    this.registroDpmnService.colocarPasoActual(3);
  }

  onFileSelected(event): void {
    this.archivo = event.target.files[0];

    if ( this.esArchivoInvalido(this.archivo) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Tipo de archivo incorrecto'});
      this.limpiarArchivo();
    }

    let esArchivoSinPeso : boolean = this.archivo.size == 0;
    let superaMaximoPeso : boolean = this.archivo.size > ConstantesApp.MAX_TAMANIO_ARCHIVO_DPMN;
    let maximaCantidadAlcanzada = this.archivosDpmn.length == ConstantesApp.MAX_CNT_ARCHIVO_DPMN;

    if ( esArchivoSinPeso ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'El archivo que se desea ajuntar esta vacío'});
      this.limpiarArchivo();
      return;
    }

    if ( superaMaximoPeso ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Cantidad de peso máximo supera el límite de 1 Mb'});
      this.limpiarArchivo();
    }

    if ( maximaCantidadAlcanzada ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Sólo se puede adjuntar ' +
                                ConstantesApp.MAX_CNT_ARCHIVO_DPMN + ' archivos'});
      this.limpiarArchivo();
    }
  }

  private esArchivoInvalido(archivo : any) : boolean {
    let nombreArchivo : string = archivo?.name;

    if ( nombreArchivo == null ) {
      return false;
    }

    return !(nombreArchivo.toLowerCase().endsWith(".pdf") || nombreArchivo.toLowerCase().endsWith(".jpg"));
  }

  private verificarEstadoGrabacion(respuesta : Respuesta<IdentificadorDpmn>) {
    if ( respuesta == null ) {
      this.mostrarDlgGuardarDpmn = false;
      return;
    }

    this.mostrarDlgGuardarDpmn = true;
    this.rptaGrabarDpmn = respuesta;
  }

  private limpiarArchivo() : void {
    this.archivo = null;
    this.inputArchivoRef.nativeElement.value = "";
  }

  adjuntarArchivo() : void {
    if ( this.archivo ) {
      let tipoDoc = this.obtenerTipoDocumento();
      this.cargandoArchivo = true;
      this.registroDpmnService.adjuntarArchivo(this.archivo, tipoDoc);
      this.limpiarArchivo();
    }

  }

  eliminarArchivo( archivo : ArchivoDpmn ) : void {
    this.confirmationService.confirm({
      message: '&iquest;Desea retirar el archivo?',
      header: 'Retirar archivo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.registroDpmnService.eliminarArchivo(archivo.id);
      }
    });
  }

  descargarArchivo( archivo : ArchivoDpmn ) : void {
    const link = this.renderer.createElement("a");
    link.href = 'data:' + archivo.nomContentType + ';base64,' + archivo.valArchivoBase64;
    link.download = archivo.nomArchivo;
    link.click();
    link.remove();
  }

  private descargarFichaResumenQR() : void {
    this.generandoQR = true;
    this.registroDpmnService.descargarFicharResumen().subscribe(response => {
      let nombreArchivo = this.registroDpmnService.numeroDpmnGenerado + ".pdf";
      let dataType = response.type;
      let binaryData = [];
      binaryData.push(response);
      const link = this.renderer.createElement("a");
      link.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      link.download = nombreArchivo;
      link.click();
      link.remove();
      this.irAlInicioRegistroDpmn();
    }, () => {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Ocurrió un error al generar el archivo PDF con el código QR de la DPMN'});
      this.irAlInicioRegistroDpmn();
    });
  }

  private irAlInicioRegistroDpmn() : void {
    this.registroDpmnService.limpiarData();
    this.generandoQR = false;
    this.mostrarDlgGuardarDpmn = false;
    this.router.navigate(['../listar-control-paso'], { relativeTo: this.activatedRoute });
  }

  private obtenerTipoDocumento() : DataCatalogo {
      let codTipoDoc = this.frmCtrlTipoDocumento.value
      return this.catalogoTipoDocAdjuntos.find( ( dataCat : DataCatalogo ) => dataCat.codDatacat == codTipoDoc );
  }

  irPaginaAnterior(): void {
    this.eliminarSubscripciones();
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  grabarDpmn(): void {
    let mensajesValidacion : string[] = this.registroDpmnService.validarGrabacionDpmn();

    if ( mensajesValidacion.length > 0 ) {
      this.messageService.clear();
      mensajesValidacion.forEach((mensaje: string) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje});
      });
      return;
    }

    this.confirmationService.confirm({
      message: '&iquest;Desea registrar la Descarga provisional de mercanc&iacute;a nacionalizada DPMN?',
      header: 'Grabar DPMN',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.registroDpmnService.grabarDpmn();
      }
    });
  }

  cancelarGrabarDpmn(): void {
    this.confirmationService.confirm({
      message: '&iquest;Desea Salir?',
      header: 'Grabar DPMN',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.irAlInicioRegistroDpmn();
      }
    });
  }

  cerrarDialogGrabarDpmn() : void {
    if (this.rptaGrabarDpmn?.estado == Estado.SUCCESS) {
        this.descargarFichaResumenQR();
    } else {
        this.mostrarDlgGuardarDpmn = false;
    }
  }

  private eliminarSubscripciones() : void {
    this.archivosDpmnSubs.unsubscribe();
    this.grabadoDpmnSubs.unsubscribe();
  }

  get frmCtrlTipoDocumento() : AbstractControl {
    return this.adjuntosForm.get("tipoDocumento") as FormControl;
  }

  private buildForm() {
    this.adjuntosForm = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]]
    });
  }

}
