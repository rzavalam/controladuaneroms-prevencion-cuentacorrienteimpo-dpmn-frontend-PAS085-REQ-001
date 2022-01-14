import { Component, OnInit } from '@angular/core';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { PciDetalle } from 'src/app/model/bean/pci-detalle';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { BusquedaPciService } from 'src/app/services/busqueda-pci.service';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Estado } from 'src/app/model/common/Estado';
import { PuestoControlFuncionario } from 'src/app/model/bean/puesto-control-funcionario';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { ActivatedRoute, Router } from '@angular/router';

import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';

@Component({
  selector: 'app-listar-control-paso',
  templateUrl: './listar-control-paso.component.html',
  styleUrls: ['./listar-control-paso.component.css']
})
export class ListarControlPasoComponent implements OnInit {

  rptaListaCtrlPaso: Respuesta<PciDetalle[]> = Respuesta.create(null, null);

  constructor(private busquedaPciService: BusquedaPciService,
              private tokenAccesoService: TokenAccesoService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private registroDpmnService: RegistroDpmnService,
              private ubicacionFuncionarioService: UbicacionFuncionarioService) { }

  ngOnInit(): void {
    this.cargarInformacionFuncionario();
  }

  private cargarInformacionFuncionario(): void {
    let nroRegistro : string = this.tokenAccesoService.nroRegistro;

    this.rptaListaCtrlPaso = Respuesta.create(null, Estado.LOADING);

    this.ubicacionFuncionarioService.buscar(nroRegistro).subscribe( (ubicacion: UbicacionFuncionario) => {
      this.cargarControlesPaso(ubicacion.puestoControl);
    }, () => {
      this.configRespuestaConError();
    });
  }

  private cargarControlesPaso(puestoControl: PuestoControlFuncionario) : void {
    let codAduana: string = puestoControl?.aduana?.codigo
    let codPtoCtrl: string = puestoControl.codigo;

    this.busquedaPciService.buscarParaDpmn(codAduana, codPtoCtrl).subscribe( ( listaPCI : PciDetalle[] ) => {
      this.rptaListaCtrlPaso = Respuesta.create(listaPCI, Estado.SUCCESS);
    }, () => {
      this.configRespuestaConError();
    });
  }

  private configRespuestaConError() : void {
    this.rptaListaCtrlPaso = Respuesta.create(null, Estado.ERROR);
    this.rptaListaCtrlPaso.agregarMensaje(1, "Ha ocurrido un error")
  }

  getColorControl(pci : PciDetalle) : string {

    let tipoControl : string = pci?.tipoControl?.codDatacat;

    if ( tipoControl == null ) {
      return null;
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl);
  }

  continuarRegistroDpmn(pci : PciDetalle) : void {
    this.registroDpmnService.pciDetalle = pci;
    this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
  }

}
