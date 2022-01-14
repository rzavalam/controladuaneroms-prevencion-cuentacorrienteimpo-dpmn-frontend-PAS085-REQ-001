import { environment } from '../../environments/environment';
import { InjectionToken } from '@angular/core';

export interface AppEndpointConfig {
  dni: string;
  puestoControl: string;
  ruc: string;
  ubigeo: string;
  validarDamRegistroDpmn: string;
  dpmn: string;
  damSeriesDpmn: string;
  adjuntosDpmn: string;
  verificarGrabacionDpmn: string;
  guiaRemision: string;
  ubicacionFuncionario: string;
  empresasdetranspinter: string;
  entvehiculo: string;
  declaraciones: string;
  buscarParaRectificar: string;

  getFichaResumenQr(correlativoDpmn : number) : string;
  getSaldoCtaCorrienteDam(codAduana : string, codRegimen: string, anio: number, numero: number) : string;
  getPuestosControlParaDpmn( codAduana: string, codPtoCtrl: string ) : string;
}

export const appEndpointInternet : AppEndpointConfig = {
  dni: environment.urlBase + "/v1/controladuanero/dni",
  puestoControl: environment.urlBase + "/v1/controladuanero/puestoscontrol",
  ruc: environment.urlBase + "/v1/controladuanero/ruc",
  ubigeo: environment.urlBase + "/v1/controladuanero/ubigeos",
  validarDamRegistroDpmn: environment.urlBase + "/v1/controladuanero/registrodpmn/validardeclaracion",
  dpmn: environment.urlBase + "/v1/controladuanero/dpmn",
  damSeriesDpmn: environment.urlBase + "/v1/controladuanero/damseriesdpmn",
  adjuntosDpmn: environment.urlBase + "/v1/controladuanero/adjuntosdpmn",
  verificarGrabacionDpmn: environment.urlBase + "/v1/controladuanero/dpmn/verificargrabacion",
  guiaRemision: environment.urlBase + "/v1/contribuyente/gretransportista",
  ubicacionFuncionario: "",
  empresasdetranspinter: "",
  entvehiculo: "",
  declaraciones: "",
  buscarParaRectificar: environment.urlBase + "/v1/controladuanero/scci/consultadpmn/buscarpararectificar",

  getFichaResumenQr: function (correlativoDpmn: number): string {
    return environment.urlBase + `/v1/controladuanero/dpmns/${correlativoDpmn}/ficharesumenqr`;
  },
  getSaldoCtaCorrienteDam: function (codAduana: string, codRegimen: string, anio: number, numero: number): string {
    throw new Error('Function not implemented.');
  },
  getPuestosControlParaDpmn: function (codAduana: string, codPtoCtrl: string): string {
    throw new Error('Function not implemented.');
  }
};

export const appEndpointIntranet : AppEndpointConfig = {
  dni: environment.urlBaseIntranet + "/v1/controladuanero/scci/dni",
  puestoControl: environment.urlBaseIntranet + "/v1/controladuanero/scci/puestoscontrol",
  ruc: environment.urlBaseIntranet + "/v1/controladuanero/scci/ruc",
  ubigeo: environment.urlBaseIntranet + "/v1/controladuanero/scci/ubigeos",
  validarDamRegistroDpmn: environment.urlBaseIntranet + "/v1/controladuanero/scci/registrodpmn/validardeclaracion",
  dpmn: environment.urlBaseIntranet + "/v1/controladuanero/scci/dpmn",
  damSeriesDpmn: environment.urlBaseIntranet + "/v1/controladuanero/scci/damseriesdpmn",
  adjuntosDpmn: environment.urlBaseIntranet + "/v1/controladuanero/scci/adjuntosdpmn",
  verificarGrabacionDpmn: environment.urlBaseIntranet + "/v1/controladuanero/scci/dpmn/verificargrabacion",
  guiaRemision: environment.urlBaseIntranet + "/v1/contribuyente/gretransportista",
  ubicacionFuncionario: environment.urlBaseIntranet + "/v1/controladuanero/scci/funcionario/ubicacion",
  empresasdetranspinter: environment.urlBaseIntranet + "/v1/controladuanero/scci/empresasdetranspinter",
  entvehiculo: environment.urlBaseIntranet + "/v1/controladuanero/scci/entvehiculos",
  declaraciones: environment.urlBaseIntranet + "/v1/controladuanero/scci/declaraciones",
  buscarParaRectificar: environment.urlBase + "/v1/controladuanero/scci/consultadpmn/buscarpararectificar",

  getFichaResumenQr: function (correlativoDpmn: number): string {
    return environment.urlBaseIntranet + `/v1/controladuanero/scci/dpmns/${correlativoDpmn}/ficharesumenqr`;
  },
  getSaldoCtaCorrienteDam: function (codAduana: string, codRegimen: string, anio: number, numero: number): string {
    return environment.urlBaseIntranet + `/v1/controladuanero/scci/declaraciones/${codAduana}-${codRegimen}-${anio}-${numero}/saldoctacorriente`;
  },
  getPuestosControlParaDpmn: function (codAduana: string, codPtoCtrl: string): string {
    return environment.urlBaseIntranet + `/v1/controladuanero/scci/pcis/${codAduana}-${codPtoCtrl}/listaparadpmn`;
  }
};

export const APP_ENDPOINT_CONFIG = new InjectionToken<AppEndpointConfig>('app-endpoint-config');
