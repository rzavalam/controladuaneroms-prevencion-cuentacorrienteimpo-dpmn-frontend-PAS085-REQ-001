import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ToastModule} from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

import { ItregistrodpmnRoutingModule } from './itregistrodpmn-routing.module';
import { InicioComponent } from './components/inicio/inicio.component';
import { DatosTransporteComponent } from './components/datos-transporte/datos-transporte.component';
import { DatosComprobanteComponent } from './components/datos-comprobante/datos-comprobante.component';
import { AddDeclaracionComponent } from './components/add-declaracion/add-declaracion.component';
import { ArchivoAdjuntoComponent } from './components/archivo-adjunto/archivo-adjunto.component';
import { PuestoControlService } from '../../services/puesto-control.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { RegistroDpmnService } from '../../services/registro-dpmn.service';
import { CatalogoService } from '../../services/catalogo.service';
import { PaisesService } from '../../services/paises.service';
import { SharedModule } from './../../shared/shared.module';

import { APP_ENDPOINT_CONFIG, appEndpointInternet } from '../../utils/app-endpoint-config';

@NgModule({
  declarations: [
    InicioComponent,
    DatosTransporteComponent,
    DatosComprobanteComponent,
    AddDeclaracionComponent,
    ArchivoAdjuntoComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    ItregistrodpmnRoutingModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    KeyFilterModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PuestoControlService,
    UbigeoService,
    CatalogoService,
    PaisesService,
    RegistroDpmnService, {
      provide: APP_ENDPOINT_CONFIG,
      useValue: appEndpointInternet
    }
  ]
})
export class ItregistrodpmnModule { }
