import { Component, Inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BuscarRectiDpmnService } from 'src/app/services/buscar-recti-dpmn.service';
import { AbstractControl,FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient} from '@angular/common/http';
import { PrimeNGConfig, MessageService } from 'primeng/api';
import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from 'src/app/utils/app-endpoint-config';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { RucService } from '../../../../services/ruc.service';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { ParamBusqDpmnParaRectificar } from 'src/app/model/bean/param-busq-dpmn-rectificar.model';
import { ParamBusqPlacaVehiculo } from 'src/app/model/bean/param-busq-placa-vehiculo.model';
import { ParamBusqRangoFecha } from 'src/app/model/bean/param-busq-rango-fecha.model';
import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';
import { ParamBusqDocumento } from "src/app/model/bean/param-busq-documento";
import { Respuesta } from 'src/app/model/common/Respuesta';
import { ItemDpmnParaRectificar} from 'src/app/model/bean/item-dpmn-para-rectificar.model';
import { Estado } from 'src/app/model/common/Estado';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { PuestoControlFuncionario } from 'src/app/model/bean/puesto-control-funcionario';
import { CatalogoItem } from '../../../../model/bean/catalogo-item';

@Component({
  selector: 'app-buscar-dpmn',
  templateUrl: './buscar-dpmn.component.html',
  styleUrls: ['./buscar-dpmn.component.css'],
  providers: [MessageService, DatePipe, RucService]
})
export class BuscarDpmnComponent implements OnInit {

  private RESOURCE_PUESTO_CONTROL: string = environment.urlBase + ConstantesApp.RESOURCE_PUESTO_CONTROL;

  loadingConsultar = false;
  rucDestinatario : Ruc;
  consultaForm: FormGroup;
  lstPaisVehiculo: any;
  lstAduanaDocumento: any;
  lstRegimen: any;
  lstEstados: any;
  URL_RESOURCE_RUC : string;
  esVisible: boolean = false;
  date = new Date();
  maxLengthNumDoc: number = 11;  
  loading: boolean = true;
  selectedValue: string ;
  selectedValue1: string ;
  estadoBusqueda = Estado;
  rptaItemDpmnParaRectificar  : Respuesta<ItemDpmnParaRectificar[]> = Respuesta.create(null, null);
  private patternPlaca : string = "^[A-Z0-9]*$";
  en: any;
  catalogoPais: DataCatalogo[] = new Array();
  catalogoAduanas: DataCatalogo[] = new Array();
  catalogoRegimen: DataCatalogo[] = new Array();
  catalogoEstado: DataCatalogo[] = new Array();

  constructor(private buscarRectiDpmnService : BuscarRectiDpmnService,
              private messageService: MessageService,
              private config: PrimeNGConfig,
              @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private catalogoService: CatalogoService,
              private datePipe: DatePipe, 
              private router:Router,
              private activatedRoute: ActivatedRoute,
              private rucService : RucService) {
                this.URL_RESOURCE_RUC = appEndPointConfig.ruc;                
              }

  ngOnInit(): void {

    this.buildForm();
    this.catalogoService.cargarDesdeJson("assets/json/paises.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoPais = resultado;
    });	

    this.catalogoService.cargarDesdeJson("assets/json/aduanas-busq-dam.json").subscribe((resultado : DataCatalogo[])=> {
     this.catalogoAduanas = resultado;
    });

    this.catalogoService.cargarDesdeJson("assets/json/regimen.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoRegimen = resultado;
    });

    this.catalogoService.cargarDesdeJson("assets/json/estados.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoEstado = resultado;
    });

    this.iniCtrlRucRemitente();
    this.escucharRespuestaBusqDpmn();

    this.en = {
      firstDayOfWeek: 1,
      dayNames: [ "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado" ],
      dayNamesShort: [ "Dom","Lun","Mar","Mié","Jue","Vie","Sáb" ],
      dayNamesMin: [ "D","L","M","M","J","V","S" ],
      monthNames: [ "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre" ],
      monthNamesShort: [ "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic" ],
      today: 'Hoy',
      clear: 'Borrar'
    };


  }

  /*Obtiene los valores a cargar en los dropdown*/
  getCatalogo = (url: string, tipo: number) => {
    return this.http
      .get<any>(url).subscribe((data) => {
        if (tipo == 1) {
          this.lstPaisVehiculo = data;
        } else if (tipo == 2) {
          this.lstAduanaDocumento = data;
        } else if (tipo == 3) {
          this.lstRegimen = data;
        } else if(tipo == 4) {
          this.lstEstados = data;
        }
      }, error => {
        console.log({ error });
      })
  }

 

  limpiar = () => {
    this.maxLengthNumDoc = 6;
    this.consultaForm = this.formBuilder.group({
      codPaisPlaca: [''],
      numeroPlaca: ['', [Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
      fechaInicio: new FormControl({ value: new Date(this.date.getFullYear(), this.date.getMonth(), 1), disabled: true }),
      fechaFin: new FormControl({ value: this.date, disabled: true }),
      numeroRucRemitente: [''],
      descRazonSocialRemitente: new FormControl(),      
      tipoBusqueda: ['', [Validators.required]],
      codAduanaDAM: [{ value: '', disabled: true }],
      codAduanaDocumento: [{ value: '', disabled: true }],
      anoDocumento: [{ value: this.date.getFullYear(), disabled: true }],
      numeroDocumento: [{ value: '', disabled: true }],
      anoDAM: [{ value: this.date.getFullYear(), disabled: true }],
      codRegimen: [{ value: '10', disabled: true }],
      numeroDAM: [{ value: '', disabled: true }]
      
    });  
    this.consultaForm.controls.fechaInicio.disable;
    this.consultaForm.controls.fechaFin.disable;
    this.iniCtrlRucRemitente();        

  }

  private buildForm() {
    this.limpiar();
  }

  onRadioChange = () => {
    var tipo = this.consultaForm.controls.tipoBusqueda.value;
    if (tipo == 1) {
      this.enabledDocumento();
    } else if (tipo == 2) {
      this.enabledDAM();
    } else if (tipo == 3) {
      this.enabledFechas();
    }
  }

  enabledFechas = () => {
    this.consultaForm.controls.fechaInicio.enable();
    this.consultaForm.controls.fechaFin.enable();
    this.consultaForm.controls.codAduanaDocumento.disable();
    this.consultaForm.controls.anoDocumento.disable();
    this.consultaForm.controls.numeroDocumento.disable();
    this.consultaForm.controls.codAduanaDAM.disable();
    this.consultaForm.controls.anoDAM.disable();
    this.consultaForm.controls.codRegimen.disable();
    this.consultaForm.controls.numeroDAM.disable();   
  }
  enabledDocumento = () => {
    this.consultaForm.controls.codAduanaDocumento.enable();
    this.consultaForm.controls.anoDocumento.enable();
    this.consultaForm.controls.numeroDocumento.enable();
    this.consultaForm.controls.fechaInicio.disable();
    this.consultaForm.controls.fechaFin.disable();
    this.consultaForm.controls.codAduanaDAM.disable();
    this.consultaForm.controls.anoDAM.disable();
    this.consultaForm.controls.codRegimen.disable();
    this.consultaForm.controls.numeroDAM.disable();   
  }
  enabledDAM = () => {
    this.consultaForm.controls.codAduanaDAM.enable();
    this.consultaForm.controls.anoDAM.enable();
    this.consultaForm.controls.codRegimen.enable();
    this.consultaForm.controls.numeroDAM.enable();
    this.consultaForm.controls.fechaInicio.disable();
    this.consultaForm.controls.fechaFin.disable();
    this.consultaForm.controls.codAduanaDocumento.disable();
    this.consultaForm.controls.anoDocumento.disable();
    this.consultaForm.controls.numeroDocumento.disable();
  }

  validarAnioDocumento = () => {
    if(this.consultaForm.controls.anoDocumento.value > this.date.getFullYear()){
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Año del documento no debe ser mayor a año actual' });
      this.consultaForm.controls.anoDocumento.setValue('');
    }
  }

  validarAnioDeclaracion = () => {
    if(this.consultaForm.controls.anoDAM.value > this.date.getFullYear()){
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Año de la declaración no debe ser mayor a año actual' });
      this.consultaForm.controls.anoDAM.setValue('');
    }
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

 
  consultar() {
    this.loadingConsultar = true;
    var tipo = this.frmCtrlTipoBusqueda.value;

    if (this.consultaForm.invalid) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Por favor seleccione uno de los criterios a consultar' });
      this.loadingConsultar = false;
      return;
    }

    if (tipo == 1) {
      if (!this.cumpleValidacionPorNumeroDocumento()){
        this.loadingConsultar = false;
        return;
      }
    } else if (tipo == 2) {
      if (!this.cumpleValidacionPorDAM()){
        this.loadingConsultar = false;
        return;
      }
    } else {
      if (!this.cumpleValidacionPorFecha()){
        this.loadingConsultar = false;
        return;
      }
    }
    let paramConsultar = new ParamBusqDpmnParaRectificar();
    this.frmCtrlCodPaisPlaca.value;

    paramConsultar.rucRemitente=this.frmCtrlRucRemitente.value;
    paramConsultar.placaVehiculo =  new ParamBusqPlacaVehiculo();
    paramConsultar.placaVehiculo.codPais =this.frmCtrlCodPaisPlaca.value;
    paramConsultar.placaVehiculo.numero = this.frmCtrlNumeroPlaca.value;
    if (tipo == 1) {
      paramConsultar.documento = new ParamBusqDocumento();
      paramConsultar.documento.codAduana = this.frmCtrlCodAduanaDocumento.value;
      paramConsultar.documento.anio = this.frmCtrlAnoDocumento.value;
      paramConsultar.documento.numero = this.frmCtrlNumeroDocumento.value;
    }
    if (tipo == 2) {
      paramConsultar.declaracion = new ParamBusqDcl();
      paramConsultar.declaracion.codAduana = this.frmCtrlCodAduanaDAM.value;
      paramConsultar.declaracion.codRegimen = this.frmCtrlCodRegimen.value;
      paramConsultar.declaracion.numero = this.frmCtrlNumeroDAM.value;
      paramConsultar.declaracion.anio = this.frmCtrlAnoDAM.value;
    }
    if (tipo == 3) {
      paramConsultar.rangoFechaRegistro = new ParamBusqRangoFecha();
      paramConsultar.rangoFechaRegistro.fechaInicio = new Date(this.datePipe.transform(this.frmCtrlFechaInicio.value,"dd/MM/yyyy"));
      paramConsultar.rangoFechaRegistro.fechaFin =  new Date(this.datePipe.transform(this.frmCtrlFechaFin.value,"dd/MM/yyyy"));
    }

    console.log(paramConsultar);

    this.messageService.clear;

    /*Se consume el servicio REST de validacion y busqueda de DPMNS*/
    this.buscarRectiDpmnService.buscarParaRectificar(paramConsultar); 
    this.loadingConsultar = false;

  }

  private escucharRespuestaBusqDpmn() : void  {
    this.buscarRectiDpmnService.rptaBusqDcl$.subscribe((resultado : Respuesta<ItemDpmnParaRectificar[]>) =>{
    this.rptaItemDpmnParaRectificar=resultado;
    
      if ( resultado == null ) {
        return;
      }

      if ( resultado.estado === Estado.LOADING ) {
        return;
      }
      
      let isbusqNoExitosa = (resultado==null || resultado==undefined || resultado.estado != Estado.SUCCESS);
      var cumpleValidacion = false;
     
        if(isbusqNoExitosa){
          cumpleValidacion = false;
          this.messageService.add({ key: 'msj', severity: 'warn', detail: "No existe información de DPMNs según criterio(s) ingresado(s)" });
          this.loadingConsultar = false;
          return;
        }else{
          cumpleValidacion = true;
        }
      

      if(cumpleValidacion){
        this.router.navigate(['../listar-dpmn-recti'], { relativeTo: this.activatedRoute })
      }
    });


  }

  private showMsgErrorCondicionEstadoRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: 'Número de RUC no se encuentra Activo o tiene la condición de No habido o No hallado'});
  }

  cumpleValidacionPorNumeroDocumento(): any {
    var aduana = this.consultaForm.controls.codAduanaDocumento.value;
    var anio = this.consultaForm.controls.anoDocumento.value;
    var numero = this.consultaForm.controls.numeroDocumento.value;

    if (aduana == '' || anio == '' || numero == '') {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Documento debe ingresar la aduana, año y número' });
      return false;
    }
    return true;
  }

  cumpleValidacionPorDAM(): any {
    var aduana = this.consultaForm.controls.codAduanaDAM.value;
    var anio = this.consultaForm.controls.anoDAM.value;
    var regimen = this.consultaForm.controls.codRegimen.value;
    var numero = this.consultaForm.controls.numeroDAM.value;

    if (aduana == '' || anio == '' || regimen == '' || numero == '') {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Declaración debe ingresar la aduana, año, régimen y número' });
      return false;
    }

    return true;
  }

  cumpleValidacionPorFecha(): any {
    var fechaInicio = this.consultaForm.controls.fechaInicio.value;
    var fechaFin = this.consultaForm.controls.fechaFin.value;
    var diasDif = fechaInicio.getTime() - fechaFin.getTime();
    var dias = Math.abs(Math.round(diasDif/(1000 * 60 * 60 * 24)));   
    var fechaActual = new Date();

    if (fechaInicio == null || fechaFin == null) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Fecha de registro debe ingresar fecha de inicio y fin' });
      return false;
    }

    if (fechaInicio > fechaActual) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de inicio no puede ser mayor a la fecha actual' });
      return false;
    }

    if (fechaFin > fechaActual) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de fin no puede ser mayor a la fecha actual' });
      return false;
    }

    if (fechaInicio > fechaFin) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de inicio no puede ser mayor a la fecha fin' });
      return false;
    }

    if (dias > 2) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Rango de Fecha a consultar no puede ser mayor a 2 días' });
      return false;
    }

    return true;
  }

  private iniCtrlRucRemitente() : void {
  
    this.frmCtrlRucRemitente.valueChanges.subscribe((valor: string) => {
    
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
    }


    onChangeEvent(regimen : DataCatalogo ) {
      regimen.desDataCat = regimen.codDatacat+" " + regimen.desDataCat;      
      console.log(regimen.desDataCat);
    }



  /**Inicializando ****/
  get frmCtrlCodPaisPlaca() : AbstractControl {
    return this.consultaForm.get('codPaisPlaca') as FormControl;
  }

  get frmCtrlNumeroPlaca() : AbstractControl {
    return this.consultaForm.get('numeroPlaca') as FormControl;
  }

  get frmCtrlRucRemitente() : AbstractControl {
    return this.consultaForm.get('numeroRucRemitente') as FormControl;
  }

  get frmCtrlRazonSocialDestinatario() : AbstractControl {
    return this.consultaForm.get('descRazonSocialRemitente') as FormControl;
  }

  get frmCtrlCodAduanaDocumento() : AbstractControl {
    return this.consultaForm.get('codAduanaDocumento') as FormControl;
  }

  get frmCtrlAnoDocumento() : AbstractControl {
    return this.consultaForm.get('anoDocumento') as FormControl;
  }

  get frmCtrlNumeroDocumento() : AbstractControl {
    return this.consultaForm.get('numeroDocumento') as FormControl;
  }

  get frmCtrlCodAduanaDAM() : AbstractControl {
    return this.consultaForm.get('codAduanaDAM') as FormControl;
  }

  get frmCtrlCodRegimen() : AbstractControl {
    return this.consultaForm.get('codRegimen') as FormControl;
  }

  get frmCtrlAnoDAM() : AbstractControl {
    return this.consultaForm.get('anoDAM') as FormControl;
  }

  get frmCtrlNumeroDAM() : AbstractControl {
    return this.consultaForm.get('numeroDAM') as FormControl;
  }

  get frmCtrlFechaInicio() : AbstractControl {
    return this.consultaForm.get('fechaInicio') as FormControl;
  }
  get frmCtrlFechaFin() : AbstractControl {
    return this.consultaForm.get('fechaFin') as FormControl;
  }

  get frmCtrlTipoBusqueda() : AbstractControl {
    return this.consultaForm.get('tipoBusqueda') as FormControl;
  }
}