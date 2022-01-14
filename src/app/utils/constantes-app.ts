import { Canal } from "../model/common/canal.enum";
import { FlujoVehiculo } from "../model/common/flujo-vehiculo.enum";
import { TipoControl } from "../model/common/tipo-control.enum";

/**
 * Constantes relacionadas a toda esta APP
 * @author rcontreras
 */
export class ConstantesApp {

  /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el Token de session
   */
  static readonly KEY_SESSION_TOKEN : string = "token-app-ctacorriente-impo-dpmn";

  /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el valor userdata del token de session
   */
  static readonly KEY_SESSION_USER_DATA : string = "user-data-ctacorriente-impo-dpmn";

    /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el RUC vinculado al token de session
   */
  static readonly KEY_SESSION_USER_RUC : string = "ruc-ctacorriente-impo-dpmn";

  static readonly KEY_SESSION_LOGIN : string = "login-ctacorriente-impo-dpmn";

  static readonly KEY_SESSION_ORIGEN : string = "origen-ctacorriente-impo-dpmn";

  static readonly KEY_SESSION_NRO_REGISTRO : string = "nroregistro-ctacorriente-impo-dpmn";

  static readonly KEY_SESSION_NOMBRE_COMPLETO : string = "nombrecompleto-ctacorriente-impo-dpmn";

  /**
   * Tamaño máximo en bytes permitdos para un archivo
   * que se desea adjuntar a la DPMN
   */
  static readonly MAX_TAMANIO_ARCHIVO_DPMN : number = 1048576;

  /**
   * Cantidad máxima de archivos que se pueden adjuntar a la DPMN
   */
  static readonly MAX_CNT_ARCHIVO_DPMN : number = 20;

  /**
   * Indica cuantas series de la DAM, se pueden grabar en una petición HTTP
   */
  static readonly TAMANIO_BATCH_DAMSERIESDPMN_POR_REQUEST : number = 100;

  static readonly COD_TIPO_COMP_GUIA_REMISION : string = "01";
  static readonly COD_TIPO_COMP_CARTA_PORTE : string = "02";

  static readonly ORIGEN_INTERNET : string = "IT";
  static readonly ORIGEN_INTRANET : string = "IA";

  static readonly COLOR_CANAL = new Map<string, string>([
    [Canal.ROJO, 'Red'],
    [Canal.NARANJA, 'Orange'],
    [Canal.VERDE, 'Green'],
    [Canal.DOCUMENTARIO, 'Orange'],
    [Canal.FISICO, 'Red'],
  ]);

  static readonly COLOR_CONTROL = new Map<string, string>([
    [TipoControl.FISICO, 'Red'],
    [TipoControl.DOCUMENTARIO, 'Orange']
  ]);

  static readonly ICONS_FLUJO_VEHICULO = new Map<string, string>([
    [FlujoVehiculo.BUS, 'bus_icon_64.ico'],
    [FlujoVehiculo.CARGA, 'truck__icon_64.ico'],
    [FlujoVehiculo.PARTICULAR, 'car_icon_64.ico']
  ]);

}
