import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { PuestoControl } from 'src/app/model/bean/PuestoControl';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { DniService } from '../../../../services/dni.service';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';
import { BuilderDpmnService } from '../../../../services/builder-dpmn.service';
import { CatalogoService } from '../../../../services/catalogo.service';
import { Dni } from 'src/app/model/bean/dni.model';
import { Estado } from 'src/app/model/common/Estado';
import { Dpmn } from 'src/app/model/domain/dpmn.model';
import { EmpresaTransporte } from 'src/app/model/domain/empresa-transporte.model';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { Conductor } from 'src/app/model/domain/conductor.model';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TokenAccesoService } from '../../../../services/token-acceso.service';
import { RucService } from '../../../../services/ruc.service';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { PaisesService } from 'src/app/services/paises.service';
import { MensajeBean } from 'src/app/model/common/MensajeBean';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { TipoNacionalidad } from 'src/app/model/common/tipo-nacionalidad.enum';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { EmpredtiService } from 'src/app/services/empredti.service';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { Empredti } from 'src/app/model/bean/empredti';
import { EntvehiculoService } from 'src/app/services/entvehiculo.service';
import { Entvehiculo } from 'src/app/model/bean/entvehiculo';

@Component({
  selector: 'app-form-transportista',
  templateUrl: './form-transportista.component.html',
  styleUrls: ['./form-transportista.component.css'],
  providers: [DniService, BuilderDpmnService, MessageService, RucService]
})
export class FormTransportistaComponent implements OnInit {


  private patternLicencia : string = "^[A-Z0-9]*$";
  private patternNumTelefono : string = "^[0-9]*$";
  private patternPlaca : string = "^[A-Z0-9]*$";

  private dataDpmn : Dpmn;

  private busqDniSubs : Subscription;
  private dataDpmnSubs : Subscription;
  private paisesAduCtrlSubs : Subscription;

  descIdentificacion : string = "Identificación";
  mostrarDlgRucNoValido: boolean = false;

  esDni: boolean = false;

  catalogoPaises: DataCatalogo[] = new Array();
  catalogoAduanasDescarga: DataCatalogo[] = new Array();
  catalogoTiposDocIdentidad: DataCatalogo[] = new Array();
  catalogoTiposNacionalidad: DataCatalogo[] = new Array();

  datosTransporteForm: FormGroup;

  maxlengthNumDocConductor: number = 11;

  rptaPuestoControl : Respuesta<PuestoControl[]>;

  ubicacionFuncionario: UbicacionFuncionario;

  maxlengthNumIdentificacion: number;

  descErrorIdentificacionEmpTrans: string = "Debe ingresare el dato solicitado";
  descErrorNombreEmpresa: string = "Ingresar el nombre de la empresa";

  constructor(private formBuilder: FormBuilder,
              private registroDpmnService : RegistroDpmnService,
              private builderDpmn : BuilderDpmnService,
              private messageService: MessageService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private catalogoService: CatalogoService,
              private tokenAccesoService: TokenAccesoService,
              private rucService: RucService,
              private paisesService: PaisesService,
              private ubicacionFuncionarioService: UbicacionFuncionarioService,
              private empredtiService: EmpredtiService,
              private entvehiculoService: EntvehiculoService,
              private dniService : DniService) {}

  ngOnInit(): void {
    this.buildForm();
    this.iniciarSuscripciones();
    this.registroDpmnService.colocarPasoActual(1);
  }

  private iniciarSuscripciones() {

    this.catalogoService.cargarDesdeJson("assets/json/27.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoTiposDocIdentidad = resultado;
      this.tipoDocIdenConductor.setValue("3");
    });

    this.catalogoService.cargarDesdeJson("assets/json/143.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoTiposNacionalidad = resultado;
      this.tipoNacEmpTrans.setValue("0");
    });

    this.paisesAduCtrlSubs = this.paisesService.rptPaisesAduCtrl$.subscribe( (resultado : DataCatalogo[]) => this.catalogoPaises = resultado);

    this.aduanaDescarga.valueChanges.subscribe((value: string) => {
      if ( value?.length > 0 ) {
        this.paisesService.buscarPaisesPorAduaCtrl(value);
      }
    });

    this.tipoNacEmpTrans.valueChanges.subscribe((value: string) => {
      this.identificacionEmpTrans.setValue("");

      if ( value == "0" ) {
        this.descIdentificacion = "RUC";
        this.maxlengthNumIdentificacion = 11;
        this.descErrorIdentificacionEmpTrans = "Debe ingresar el RUC de la empresa";
        this.descErrorNombreEmpresa = "Debe ingresar la razón social de la empresa";
      } else if ( value == "1" ) {
        this.descIdentificacion = "Código";
        this.maxlengthNumIdentificacion = 4;
        this.descErrorIdentificacionEmpTrans = "Debe ingresar el código de la empresa";
        this.descErrorNombreEmpresa = "Debe ingresar el nombre de la empresa";
      }

    });

    this.identificacionEmpTrans.valueChanges.subscribe( (valor: string) => {
      this.mostrarNombreEmpresa(valor);
    });

    this.tipoDocIdenConductor.valueChanges.subscribe((value: string) => {
        this.configCtrlIdentidadConductor(value);
    });

    this.numDocIdenConductor.valueChanges.subscribe((valor: string) => {
      if ( this.tipoDocIdenConductor.value == "3" ) {
        this.limpiarNombresConductor();
        this.dniService.buscar(valor);
      }
    });

    this.placaEmpTrans.valueChanges.subscribe( (valor: string) => {
        this.validarPlacaEmpTrans(valor);
    });

    this.busqDniSubs = this.dniService.rptaDni$.subscribe((valor: Respuesta<Dni>) => {
        this.completarDatosConductor(valor);
    });

    this.dataDpmnSubs = this.registroDpmnService.dpmn$.subscribe((objDpmn : Dpmn ) => {
      this.dataDpmn = objDpmn;
      this.cargarLugarControl();
      this.cargarInformacion();
    });

  }

  private validarPlacaEmpTrans( valorPlaca : string ) : void {
    let esPaisPlacaInvalido = this.paisPlacaEmpTrans.invalid;

    if (esPaisPlacaInvalido) {
      return;
    }

    let esPlacaInvalido = this.placaEmpTrans.invalid;

    if (esPlacaInvalido) {
      return;
    }

    let codPais : string = this.paisPlacaEmpTrans.value;

    this.entvehiculoService.buscar(codPais, valorPlaca).subscribe( (entvehiculo : Entvehiculo) => {
      let codPlaca : string = entvehiculo?.cplaca

      if ( codPlaca == null ) {
        this.mostrarMsgNoExistePlacaEmpTransp();
      }

    }, () => {
      this.mostrarMsgNoExistePlacaEmpTransp();
    });
  }

  private mostrarMsgNoExistePlacaEmpTransp() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
              detail: 'Placa de vehículo no existe en el directorio de vehículos de empresas de transporte terrestre'});
  }

  private mostrarNombreEmpresa(identidad: string) : void {

    if ( identidad == null ) {
      return;
    }

    let regexRUC : RegExp = /[0-9]{11}/;
    let regexCodEmp : RegExp = /[0-9]{4}/;

    let tipoNacionalidad : string = this.tipoNacEmpTrans.value;

    let esRucValido = identidad.match(regexRUC);
    let isCodEmpValido = identidad.match(regexCodEmp);

      if ( tipoNacionalidad == TipoNacionalidad.NACIONAL && esRucValido ) {
          this.mostrarRazonSocialEmpTransp(identidad);
          return;
      }

      if ( tipoNacionalidad == TipoNacionalidad.EXTRANJERO && isCodEmpValido ) {
        this.mostrarNombreEmpTransp(identidad);
        return;
      }

      this.nombreEmpTrans.setValue("");
  }

  private mostrarRazonSocialEmpTransp(numeroRUC: string) : void {
    this.rucService.buscarRuc(numeroRUC).subscribe( (rpta : Ruc) => {
      if ( this.isNoValidoEstadoCondicionRuc(rpta) ) {
        this.nombreEmpTrans.setValue("");
        this.mostrarMsgNoValidoEstadoCondicionRuc();
        return;
      }

      this.nombreEmpTrans.setValue(rpta.razonSocial);
    });
  }

  private mostrarNombreEmpTransp(codEmpTrans: string) : void {
    this.empredtiService.buscar(codEmpTrans).subscribe( (empredti : Empredti) => {

      if ( empredti == null ) {
        this.mostrarMsgEmpTranspNoExiste();
        this.nombreEmpTrans.setValue("");
        return;
      }

      this.nombreEmpTrans.setValue(empredti.dnombre);
    }, () => {
      this.mostrarMsgEmpTranspNoExiste();
      this.nombreEmpTrans.setValue("");
    });
  }

  private mostrarMsgEmpTranspNoExiste() : void {
    this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Empresa de transporte no existe en el directorio de empresas de transporte terrestre'});
  }

  private isNoValidoEstadoCondicionRuc(ruc: Ruc) : boolean {

    let esNoHabidoOrNoHallado : boolean = this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HABIDO) ||
    this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HALLADO);

    let esNoActivo : boolean = !this.rucService.tieneEstado(ruc, EstadoRuc.ACTIVO);

    return esNoHabidoOrNoHallado || esNoActivo;
  }

  private mostrarMsgNoValidoEstadoCondicionRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"info", summary: 'Mensaje',
        detail: 'RUC no se encuentra activo y/o tiene condición de No habido o no hallado'});
  }

  private eliminarSubscripciones() : void {
    this.busqDniSubs.unsubscribe();
    this.dataDpmnSubs.unsubscribe();
    this.paisesAduCtrlSubs.unsubscribe();
  }

  private obtenerPais(codigo : string) : DataCatalogo {
    return this.catalogoPaises.find(item => item.codDatacat == codigo);
  }

  private obtenerTipoNacionalidad(codigo : string) : DataCatalogo {
    return this.catalogoTiposNacionalidad.find(item => item.codDatacat == codigo);
  }

  private obtenerTipoDocIdentidad(codigo : string) : DataCatalogo {
    return this.catalogoTiposDocIdentidad.find(item => item.codDatacat == codigo);
  }

  private cargarLugarControl() : void {
    let nroRegistro : string = this.tokenAccesoService.nroRegistro;

    this.ubicacionFuncionarioService.buscar(nroRegistro).subscribe( ( ubicacion : UbicacionFuncionario ) => {
      this.ubicacionFuncionario = ubicacion;
      this.aduanaDescarga.setValue(ubicacion?.puestoControl?.aduana?.codigo);
      this.puestoControl.setValue(ubicacion?.puestoControl?.codigo);

      let arrPuestosControl : PuestoControl[] = new Array();
      let datCatPtoControl : PuestoControl = new PuestoControl();

      datCatPtoControl.codigo = ubicacion?.puestoControl?.codigo;
      datCatPtoControl.descripcion = ubicacion?.puestoControl?.descripcion;

      arrPuestosControl.push(datCatPtoControl);

      this.rptaPuestoControl = Respuesta.create(arrPuestosControl, Estado.SUCCESS);

      if ( this.catalogoAduanasDescarga.length <= 0 ) {
        let datCatAduanaDescarga : DataCatalogo = new DataCatalogo();
        datCatAduanaDescarga.codDatacat = ubicacion?.puestoControl?.aduana?.codigo;
        datCatAduanaDescarga.desDataCat = ubicacion?.puestoControl?.aduana?.descripcion;

        this.catalogoAduanasDescarga.push(datCatAduanaDescarga);
      }

    });
  }

  private cargarInformacion() : void {
    this.aduanaDescarga.setValue(this.dataDpmn?.aduanaDescarga?.codDatacat);
    this.puestoControl.setValue(this.dataDpmn?.puestoControlDescarga?.codDatacat);

    this.tipoNacEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.tipoNacionalidad?.codDatacat);
    this.identificacionEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.numDocIdentidad);
    this.paisEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.paisEmpresa?.codDatacat);
    this.nombreEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.nomEmpresa);
    this.paisPlacaEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.paisPlaca?.codDatacat);
    this.placaEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.nomPlaca);
    this.emailEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.valEmail);
    this.paisPlacaCarretaEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.paisPlacaCarreta?.codDatacat);
    this.placaCarretaEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.nomPlacaCarreta);
    this.telefonoEmpTrans.setValue(this.dataDpmn?.empresaTransporte?.numTelefono);

    this.nacionalidadConductor.setValue( this.dataDpmn?.conductor?.pais?.codDatacat);

    let tipoDocIden = this.dataDpmn?.conductor?.tipoDocIdentidad?.codDatacat;

    if ( tipoDocIden ) {
      this.tipoDocIdenConductor.setValue( this.dataDpmn?.conductor?.tipoDocIdentidad?.codDatacat);
    }

    this.numDocIdenConductor.setValue( this.dataDpmn?.conductor?.numDocIdentidad);
    this.nombreConductor.setValue( this.dataDpmn?.conductor?.nomConductor);
    this.apellidoConductor.setValue( this.dataDpmn?.conductor?.apeConductor );
    this.licenciaConductor.setValue( this.dataDpmn?.conductor?.numLicencia );

    let tipoNacionalidad = this.dataDpmn?.empresaTransporte?.tipoNacionalidad?.codDatacat;

    if ( tipoNacionalidad == "0" ) {
      this.descIdentificacion = "RUC";
    } else if (tipoNacionalidad == "1" ) {
      this.descIdentificacion = "Código";
    }

  }

  private faltaCompletarInformacion() : boolean {
    let formularioValido = this.datosTransporteForm.valid;
    this.messageService.clear();


      if ( !formularioValido ) {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta completar informacion'});
        return true;
      }

    return false;
  }

  irPaginaSiguiente() : void {

      if (  this.faltaCompletarInformacion() ) {
        return;
      }

      this.guardarInformacion();
      this.eliminarSubscripciones();
      this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  private guardarInformacion() : void {
    this.builderDpmn.iniciar(this.dataDpmn);

    let puestoControl = this.rptaPuestoControl.data.find( ( itemPuestoControl : PuestoControl ) =>
                                  itemPuestoControl.codigo ==  this.puestoControl.value);

    let objAduanaDescarga : DataCatalogo = this.catalogoAduanasDescarga.find( ( itemAduanaDescarga : DataCatalogo ) =>
                                                itemAduanaDescarga.codDatacat == this.aduanaDescarga.value);

    this.builderDpmn.setAduana(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    this.builderDpmn.setAnio(new Date().getFullYear());
    this.builderDpmn.setAduanaDescarga(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    this.builderDpmn.setPuestoControlDescarga(puestoControl?.codigo, puestoControl?.descripcion);

    let empTrans : EmpresaTransporte = new EmpresaTransporte();

    let tipoNacionalidad : DataCatalogo = this.obtenerTipoNacionalidad(this.tipoNacEmpTrans.value);

    empTrans.tipoNacionalidad = tipoNacionalidad;
    empTrans.numDocIdentidad = this.identificacionEmpTrans.value;

    this.completarTipoDocIdentidadEmpTrans(empTrans);

    let paisEmprTrans = this.obtenerPais(this.paisEmpTrans.value);

    empTrans.paisEmpresa = paisEmprTrans;
    empTrans.nomEmpresa = this.nombreEmpTrans.value;

    let flujoVehiculo = new DataCatalogo();
    flujoVehiculo.codDatacat = "01";
    flujoVehiculo.desDataCat = "Carga";

    empTrans.flujoVehiculo =  flujoVehiculo;

    let paisPlaca = this.obtenerPais(this.paisPlacaEmpTrans.value);

    empTrans.paisPlaca = paisPlaca;
    empTrans.nomPlaca = this.placaEmpTrans.value;
    empTrans.valEmail = this.emailEmpTrans.value;

    let paisPlacaCarreta = this.obtenerPais(this.paisPlacaCarretaEmpTrans.value);

    empTrans.paisPlacaCarreta = paisPlacaCarreta;
    empTrans.nomPlacaCarreta = this.placaCarretaEmpTrans.value;

    empTrans.numTelefono = this.telefonoEmpTrans.value;

    this.builderDpmn.setEmpresaTransporte(empTrans);

    let conductor = new Conductor();

    let paisConductor = this.obtenerPais(this.nacionalidadConductor.value);

    conductor.pais = paisConductor;

    let tipoDocIdenConductor = this.obtenerTipoDocIdentidad(this.tipoDocIdenConductor.value);

    conductor.tipoDocIdentidad = tipoDocIdenConductor;
    conductor.numDocIdentidad = this.numDocIdenConductor.value;
    conductor.nomConductor = this.nombreConductor.value;
    conductor.apeConductor = this.apellidoConductor.value;
    conductor.numLicencia = this.licenciaConductor.value;

    this.builderDpmn.setConductor(conductor);

    this.dataDpmn = this.builderDpmn.resultado;

    this.registroDpmnService.putDpmn(this.dataDpmn);
  }

  private completarTipoDocIdentidadEmpTrans(empTrans : EmpresaTransporte) {
    let esInternet : boolean = this.tokenAccesoService.origen == ConstantesApp.ORIGEN_INTERNET

    if ( esInternet ) {
      let tipoDocIden : DataCatalogo = new DataCatalogo();
      tipoDocIden.codDatacat = "4";
      tipoDocIden.desDataCat = "RUC";
      empTrans.tipoDocIdentidad = tipoDocIden;
    }

  }

  private limpiarNombresConductor() {
    this.nombreConductor.setValue("");
    this.apellidoConductor.setValue("");
  }

  private completarDatosConductor(valor: Respuesta<Dni>) : void {
    if ( valor?.data != null && valor?.estado == Estado.SUCCESS ) {
      this.nombreConductor.setValue(valor.data.nombres);
      this.apellidoConductor.setValue(valor.data.apellidos);
    } else {
      this.messageService.clear();
      this.limpiarNombresConductor();

      valor?.mensajes?.forEach( ( mensaje: MensajeBean ) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje.msg});
      });

    }
  }

  private configCtrlIdentidadConductor(tipoDocIdentidad: string) : void {

    if ( tipoDocIdentidad == "3" ) {
      this.maxlengthNumDocConductor = 8;
      this.numDocIdenConductor.setValue("");

      this.esDni = true;

      this.limpiarNombresConductor();
      return;
    }

    this.esDni = false;

    this.maxlengthNumDocConductor = 11;
  }

  private formControlSetReadOnly(formControl: AbstractControl, isReadonly: boolean) : void {
    (<any>formControl).nativeElement.readOnly = isReadonly;
}

  // Controles de datos de la aduana / lugar control
  get aduanaDescarga(): AbstractControl {
    return this.datosTransporteForm.controls['lugarDescarga'].get('aduana') as FormControl;
  }

  get puestoControl(): AbstractControl {
    return this.datosTransporteForm.controls['lugarDescarga'].get('puestoControl') as FormControl;
  }
  // =================================================

  // Controles de la empresa de transporte:
  get tipoNacEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('tipoNacionalidad') as FormControl;
  }

  get identificacionEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('identificacion') as FormControl;
  }

  get paisEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('pais') as FormControl;
  }

  get nombreEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('nombre') as FormControl;
  }

  get flujoVehiculoEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('flujoVehiculo') as FormControl;
  }

  get paisPlacaEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('paisPlaca') as FormControl;
  }

  get placaEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('placa') as FormControl;
  }

  get emailEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('email') as FormControl;
  }

  get paisPlacaCarretaEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('paisPlacaCarreta') as FormControl;
  }

  get placaCarretaEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('placaCarreta') as FormControl;
  }

  get telefonoEmpTrans(): AbstractControl {
    return this.datosTransporteForm.controls['empresaTransporte'].get('telefono') as FormControl;
  }
  // =============================================

  // Controles de la info del conductor:
  get nacionalidadConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('nacionalidad') as FormControl;
  }

  get tipoDocIdenConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('tipoDocIdentidad') as FormControl;
  }

  get numDocIdenConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('numDocIdentidad') as FormControl;
  }

  get nombreConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('nombre') as FormControl;
  }

  get apellidoConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('apellido') as FormControl;
  }

  get licenciaConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('licencia') as FormControl;
  }
  // =============================================

  private buildForm() {
    this.datosTransporteForm = this.formBuilder.group(
      {
        //Lugar de descarga
        lugarDescarga: this.formBuilder.group({
          aduana: [{value: '', disabled: true}, [Validators.required]],
          puestoControl: [{value: '', disabled: true}, [Validators.required]]
        }),
        //Empresa de Transporte
        empresaTransporte: this.formBuilder.group({
          tipoNacionalidad: ['', [Validators.required]],
          identificacion: ['', [Validators.required]],
          pais: ['', [Validators.required]],
          nombre: ['', [Validators.required]],
          flujoVehiculo: [{value: 'Carga', disabled: true}],
          paisPlaca: ['', [Validators.required]],
          placa: ['', [Validators.required, Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          email: ['', [Validators.required, Validators.email]],
          paisPlacaCarreta: '',
          placaCarreta: ['', [Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          telefono: ['', [Validators.required, Validators.minLength(5), Validators.pattern(this.patternNumTelefono)]]
        }),
        //Conductor
        conductor: this.formBuilder.group({
          nacionalidad: ['', [Validators.required]],
          tipoDocIdentidad: ['', [Validators.required]],
          numDocIdentidad: ['', [Validators.required]],
          nombre: ['', [Validators.required, Validators.minLength(2)]],
          apellido: ['', [Validators.required, Validators.minLength(2)]],
          licencia: ['', [Validators.required, Validators.pattern(this.patternLicencia)]]
        })
      }
    );
  }
}
