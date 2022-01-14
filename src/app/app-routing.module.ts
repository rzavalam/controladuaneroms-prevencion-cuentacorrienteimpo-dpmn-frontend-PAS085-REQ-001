import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

//Lazy Loading de modulos
const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'itregistrodpmn', loadChildren: () =>
      import('./modules/itregistrodpmn/itregistrodpmn.module').
          then(m => m.ItregistrodpmnModule)},
  { path: 'iaregistrodpmn', loadChildren: () =>
      import('./modules/iaregistrodpmn/iaregistrodpmn.module').
          then(m => m.IaregistrodpmnModule)},
  { path: 'itrectificaciondpmn', loadChildren: () =>
      import('./modules/itrectificaciondpmn/itrectificaciondpmn.module').
          then(m => m.ItrectificaciondpmnModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
