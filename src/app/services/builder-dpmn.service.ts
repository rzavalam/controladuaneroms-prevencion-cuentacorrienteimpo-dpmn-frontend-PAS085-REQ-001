import { Injectable } from '@angular/core';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { Ubigeo } from '../model/common/ubigeo.model';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { Conductor } from '../model/domain/conductor.model';
import { DatoComplementario } from '../model/domain/dato-complementario.model';
import {Dpmn} from '../model/domain/dpmn.model';
import { EmpresaTransporte } from '../model/domain/empresa-transporte.model';

/**
 * @author rcontreras
 * Builder para crear el objeto DPMN
 */
@Injectable()
export class BuilderDpmnService {

  private dpmn: Dpmn = new Dpmn();

  constructor() {}

  reset() {
    this.dpmn = new Dpmn();
  }

  iniciar(newDpmn: Dpmn) : void {
    this.dpmn = newDpmn;
  }

  get resultado() : Dpmn {
    return this.dpmn;
  }

  private setPropertyDataCatalogo(obj: any, nomProp: string, cod: string, desc: string) : void {
    if ( cod == null && desc == null ) {
      obj[nomProp] = null;
      return;
    }

    obj[nomProp] = new DataCatalogo();

    obj[nomProp].codDatacat = cod;
    obj[nomProp].desDataCat = desc;
  }

  private configDatoComplementario() {
    if ( this.dpmn.datoComplementario == null ) {
      this.dpmn.datoComplementario = new DatoComplementario();
    }
  }

  public setNumCorrelativo(newNumCorrelativo: number) {
    this.dpmn.numCorrelativo = newNumCorrelativo;
  }

  setAduana(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "aduana", cod, desc);
  }

  setAnio(anio: number) : void {
    this.dpmn.annDpmn = anio;
  }

  setEstado(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "estado", cod, desc);
  }

  setAduanaDescarga(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "aduanaDescarga", cod, desc);
  }

  setPuestoControlDescarga(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "puestoControlDescarga", cod, desc);
  }

  setActorRegistro(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "actorRegistro", cod, desc);
  }

  setTipoAnulacion(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.dpmn, "tipoAnulacion", cod, desc);
  }

  setUbigeoOrigen(newUbigeoOrigen: Ubigeo) : void {
    this.configDatoComplementario();
    this.dpmn.datoComplementario.ubigeoOrigen = newUbigeoOrigen;
  }

  setObservaciones(newObs: string) : void {
    this.configDatoComplementario();
    this.dpmn.datoComplementario.desObservacion = newObs;

  }

  addComprobantePago( newComprobantePago: ComprobantePago ) : void {
    if ( this.dpmn == null ) {
      this.dpmn = new Dpmn();
    }

    if ( this.dpmn.comprobantePago == null ) {
      this.dpmn.comprobantePago = new Array();
    }

    let correlativo : number = this.obtenerCorrelativoComprob();
    newComprobantePago.numCorrelativo = correlativo;
    this.dpmn.comprobantePago.push(newComprobantePago);
  }

  private obtenerCorrelativoComprob() : number {

    if ( this.dpmn.comprobantePago == null || this.dpmn.comprobantePago.length <= 0 ) {
      return 1;
    }

    return Math.max.apply(Math, this.dpmn.comprobantePago.map( (itComp) => itComp.numCorrelativo)) + 1;
  }

  public setEmpresaTransporte(empTrans : EmpresaTransporte) : void {
    this.dpmn.empresaTransporte = empTrans;
  }

  public setConductor (valor : Conductor) : void {
    this.dpmn.conductor = valor;
  }

  public transporte = new class {

    private empTrans : EmpresaTransporte = new EmpresaTransporte();

    constructor(private builderDpmn: BuilderDpmnService) {
      this.builderDpmn.dpmn.empresaTransporte = this.empTrans;
    }

    public setTipoNacionalidad(tipoNac : DataCatalogo) : void {
      this.empTrans.tipoNacionalidad = tipoNac;
    }

    public setCodigo(valor : string) : void {
      this.empTrans.codEmpTransporte = valor;
    }

    public setTipoDocIdentidad(tipoDocIdentidad : DataCatalogo) : void {
      this.empTrans.tipoDocIdentidad = tipoDocIdentidad;
    }

    public setNumDocIdentidad(valor : string) : void {
      this.empTrans.numDocIdentidad = valor;
    }

    public setPais(newPais : DataCatalogo) : void {
      this.empTrans.paisEmpresa = newPais;
    }

    public setNombre(valor : string) : void {
      this.empTrans.nomEmpresa = valor;
    }

    public setFlujoVehiculo(newFlujoVehi : DataCatalogo) : void {
      this.empTrans.flujoVehiculo = newFlujoVehi;
    }

    public setPaisPlaca(newPaisPlaca : DataCatalogo) : void {
      this.empTrans.paisPlaca = newPaisPlaca;
    }

    public setPlaca(valor : string) : void {
      this.empTrans.nomPlaca = valor;
    }

    public setEmail(valor : string) : void {
      this.empTrans.valEmail = valor;
    }

    public setPaisPlacaCarreta(valor : DataCatalogo) : void {
      this.empTrans.paisPlacaCarreta = valor;
    }

    public setPlacaCarreta(valor : string) : void {
      this.empTrans.nomPlacaCarreta = valor;
    }

    public setNumTelefono(valor : string) : void {
      this.empTrans.numTelefono = valor;
    }

  }(this);

}
