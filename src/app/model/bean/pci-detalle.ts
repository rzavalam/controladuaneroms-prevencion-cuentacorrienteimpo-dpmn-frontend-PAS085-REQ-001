import {DataCatalogo} from '../common/data-catalogo.model';

export class PciDetalle {
  numCorrelativo: number;
  aduana: DataCatalogo;
  puestoControl: DataCatalogo;
  annPci: number;
  numPci: number;
  paisPlaca: DataCatalogo;
  nomPlaca: string;
  paisPlacaCarreta: DataCatalogo;
  nomPlacaCarreta: string;
  flujoVehiculo: DataCatalogo;
  tipoControl: DataCatalogo;
  fecInicioControl: string;
  tiempoTranscurrido: number;
  codFuncionario: string;
  nomFuncionario: string;
}
