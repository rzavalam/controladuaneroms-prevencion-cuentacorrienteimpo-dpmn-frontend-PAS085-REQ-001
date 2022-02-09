import {DataCatalogo} from '../common/data-catalogo.model';
import { Auditoria } from '../../model/domain/auditoria.model';

export class ItemDpmnParaRectificar {
    correlativoDpmn: number;
    numeroDpmn: string;
    paisPlaca: DataCatalogo;
    nomPlaca: string;
    paisPlacaCarreta: DataCatalogo;
    nomPlacaCarreta: string;
    flujoVehiculo: DataCatalogo;
    auditoria : Auditoria;
    tiempoAnulacion: number;
    numRucPrimerRemitente : string;
    desRazonSocialPrimerRemitente : string;
    cntSeries : number;
    actorRegistro: DataCatalogo;
}
