import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InicioComponent} from './components/inicio/inicio.component';
import {DatosTransporteComponent} from './components/datos-transporte/datos-transporte.component';
import {DatosComprobanteComponent} from './components/datos-comprobante/datos-comprobante.component';
import {ArchivoAdjuntoComponent} from './components/archivo-adjunto/archivo-adjunto.component';
import {AddDeclaracionComponent} from './components/add-declaracion/add-declaracion.component';

const routes: Routes = [
  {
    path: '', component: InicioComponent,
    children: [
      { path: 'datos-transporte', component: DatosTransporteComponent },
      { path: 'comprobantes', component: DatosComprobanteComponent },
      { path: 'adjuntar-archivos', component: ArchivoAdjuntoComponent },
      { path: 'add-declaracion', component: AddDeclaracionComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItregistrodpmnRoutingModule { }
