import { Participante } from '../bean/participante';
import { CatalogoItem } from './catalogo-item';

export class Declaracion {
  codAduana: string;
  codRegimen: string;
  anio: number;
  numero: number;
  importador: Participante;
  canal: CatalogoItem;
  fechaNumeracion: string;
  fechaLevante: string;
  totalSeries: number;
  totalPesoBruto: number;
  totalPesoNeto: number;
}
