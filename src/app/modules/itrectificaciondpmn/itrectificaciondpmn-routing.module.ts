import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuscarDpmnComponent } from './components/buscar-dpmn/buscar-dpmn.component'
import { ListaDpmnRectiComponent } from './components/lista-dpmn-recti/lista-dpmn-recti.component';

const routes: Routes = [
  {
    path: 'buscar-dpmn', component: BuscarDpmnComponent,
  },
  {
    path: 'listar-dpmn-recti', component: ListaDpmnRectiComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItrectificaciondpmnRoutingModule { }
