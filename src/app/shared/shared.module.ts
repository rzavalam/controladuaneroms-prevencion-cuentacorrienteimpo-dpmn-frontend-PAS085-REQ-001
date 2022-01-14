import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectFromJsonComponent } from './components/select-from-json/select-from-json.component';
import { CargarJsonDirective } from './directives/cargar-json.directive';
import { QuitarCommaPipe } from './pipes/quitar-comma.pipe';
import { IconFlujoVehiculoComponent } from './components/icon-flujo-vehiculo/icon-flujo-vehiculo.component'

@NgModule({
  declarations: [
    SelectFromJsonComponent,
    CargarJsonDirective,
    QuitarCommaPipe,
    IconFlujoVehiculoComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SelectFromJsonComponent,
    CargarJsonDirective,
    QuitarCommaPipe,
    IconFlujoVehiculoComponent
  ]
})
export class SharedModule { }
