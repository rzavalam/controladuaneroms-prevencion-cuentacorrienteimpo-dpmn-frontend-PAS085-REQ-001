import { ParamBusqPlacaVehiculo } from "./param-busq-placa-vehiculo.model";
import { ParamBusqDocumento } from "./param-busq-documento";
import { ParamBusqRangoFecha } from "./param-busq-rango-fecha.model";
import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';

export class ParamBusqDpmnParaRectificar {
    rucRemitente: string;
    placaVehiculo: ParamBusqPlacaVehiculo;
    documento: ParamBusqDocumento;
    declaracion: ParamBusqDcl;
    rangoFechaRegistro: ParamBusqRangoFecha;  
}