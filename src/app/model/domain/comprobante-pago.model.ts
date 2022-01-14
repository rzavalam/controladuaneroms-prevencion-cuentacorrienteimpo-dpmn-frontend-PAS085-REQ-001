import { DataCatalogo } from "../common/data-catalogo.model";
import { Ubigeo } from "../common/ubigeo.model";
import { TipoComprobante } from "../common/tipo-comprobante.enum";

export class ComprobantePago {
  type: TipoComprobante;
  numCorrelativo: number;
  tipoComprobante: DataCatalogo;
  numRucDestinatario: string;
  desRazonSocialDestinatario: string;
  motivoDeTraslado: DataCatalogo;
  ubigeoDestino: Ubigeo;
  indEliminado: boolean;
}
