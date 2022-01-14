import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarControlPasoComponent } from './components/listar-control-paso/listar-control-paso.component';
import { AddDamComprobanteComponent } from './components/add-dam-comprobante/add-dam-comprobante.component';
import { FormTransportistaComponent } from './components/form-transportista/form-transportista.component';
import { FormDamComprobanteComponent } from './components/form-dam-comprobante/form-dam-comprobante.component';
import { FormAdjuntoComponent } from './components/form-adjunto/form-adjunto.component';
import { IniciarRegistroComponent } from './components/iniciar-registro/iniciar-registro.component';

const routes: Routes = [
  {
    path: 'listar-control-paso', component: ListarControlPasoComponent,
  },
  {
    path: '', component: IniciarRegistroComponent,
    children: [
      { path: 'datos-transporte', component: FormTransportistaComponent },
      { path: 'comprobantes', component: FormDamComprobanteComponent },
      { path: 'adjuntar-archivos', component: FormAdjuntoComponent },
      { path: 'add-declaracion', component: AddDamComprobanteComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IaregistrodpmnRoutingModule { }
