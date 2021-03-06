import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './../../shared/shared.module';

import { APP_ENDPOINT_CONFIG, appEndpointInternet } from '../../utils/app-endpoint-config';

import { CatalogoService } from '../../services/catalogo.service';
import { PaisesService } from '../../services/paises.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { BuscarRectiDpmnService } from '../../services/buscar-recti-dpmn.service';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {MessagesModule} from 'primeng/messages';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ToastModule} from 'primeng/toast';
import {DatePipe } from '@angular/common'
import {ConfirmDialogModule } from 'primeng/confirmdialog';
import {DialogModule } from 'primeng/dialog';
import {CalendarModule} from 'primeng/calendar';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {RadioButtonModule } from 'primeng/radiobutton';
import {ItrectificaciondpmnRoutingModule } from './itrectificaciondpmn-routing.module';
import {BuscarDpmnComponent } from './components/buscar-dpmn/buscar-dpmn.component';
import {ListaDpmnRectiComponent } from './components/lista-dpmn-recti/lista-dpmn-recti.component';


@NgModule({
  declarations: [BuscarDpmnComponent, ListaDpmnRectiComponent],
  imports: [
    SharedModule,
    CommonModule,
    ItrectificaciondpmnRoutingModule,
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
    ReactiveFormsModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    ButtonModule,
    MessagesModule
  ],  
  exports: [
    ButtonModule
  ],
  providers: [
    CatalogoService,
    PaisesService,
    UbigeoService,
    DatePipe,
    BuscarRectiDpmnService, {
      provide: APP_ENDPOINT_CONFIG,
      useValue: appEndpointInternet
    }
  ]
})
export class ItrectificaciondpmnModule { }
