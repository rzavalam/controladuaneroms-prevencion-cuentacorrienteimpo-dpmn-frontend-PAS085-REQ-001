import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './../../shared/shared.module';

import { APP_ENDPOINT_CONFIG, appEndpointIntranet } from '../../utils/app-endpoint-config';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ToastModule} from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputTextModule} from 'primeng/inputtext';

import { PuestoControlService } from '../../services/puesto-control.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { RegistroDpmnService } from '../../services/registro-dpmn.service';
import { CatalogoService } from '../../services/catalogo.service';
import { PaisesService } from '../../services/paises.service';
import { UbicacionFuncionarioService } from '../../services/ubicacion-funcionario.service';
import { EmpredtiService } from '../../services/empredti.service';
import { EntvehiculoService } from '../../services/entvehiculo.service';
import { SaldoSerieDamService } from '../../services/saldo-serie-dam.service';
import { DeclaracionService } from '../../services/declaracion.service';
import { BusquedaPciService } from '../../services/busqueda-pci.service';

import { IaregistrodpmnRoutingModule } from './iaregistrodpmn-routing.module';
import { ListarControlPasoComponent } from './components/listar-control-paso/listar-control-paso.component';
import { IniciarRegistroComponent } from './components/iniciar-registro/iniciar-registro.component';
import { AddDamComprobanteComponent } from './components/add-dam-comprobante/add-dam-comprobante.component';
import { FormTransportistaComponent } from './components/form-transportista/form-transportista.component';
import { FormDamComprobanteComponent } from './components/form-dam-comprobante/form-dam-comprobante.component';
import { FormAdjuntoComponent } from './components/form-adjunto/form-adjunto.component';

@NgModule({
  declarations: [
    ListarControlPasoComponent,
    IniciarRegistroComponent,
    AddDamComprobanteComponent,
    FormTransportistaComponent,
    FormDamComprobanteComponent,
    FormAdjuntoComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    IaregistrodpmnRoutingModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    KeyFilterModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressSpinnerModule,
    InputTextModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PuestoControlService,
    UbigeoService,
    CatalogoService,
    PaisesService,
    UbicacionFuncionarioService,
    EmpredtiService,
    EntvehiculoService,
    SaldoSerieDamService,
    DeclaracionService,
    BusquedaPciService,
    RegistroDpmnService, {
      provide: APP_ENDPOINT_CONFIG,
      useValue: appEndpointIntranet
    }
  ]
})
export class IaregistrodpmnModule { }
