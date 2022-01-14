import { Component, Input, OnInit } from '@angular/core';
import { FlujoVehiculo } from 'src/app/model/common/flujo-vehiculo.enum';
import { ConstantesApp } from 'src/app/utils/constantes-app';

@Component({
  selector: 'app-icon-flujo-vehiculo',
  templateUrl: './icon-flujo-vehiculo.component.html',
  styleUrls: ['./icon-flujo-vehiculo.component.css']
})
export class IconFlujoVehiculoComponent implements OnInit {

  @Input() codFlujoVehiculo;
  flujoVehiculo : FlujoVehiculo;
  iconVehiculo : string;
  rutaIconVehiculo : string;

  constructor() { }

  ngOnInit(): void {
    this.iconVehiculo = ConstantesApp.ICONS_FLUJO_VEHICULO.get(this.codFlujoVehiculo);

    if ( this.iconVehiculo != null ) {
      this.rutaIconVehiculo = 'assets/icons/' + this.iconVehiculo;
    }
  }

}
