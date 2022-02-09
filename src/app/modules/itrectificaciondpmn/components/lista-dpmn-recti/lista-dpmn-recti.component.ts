import { Component, OnInit } from '@angular/core';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Estado } from 'src/app/model/common/Estado';
import { ItemDpmnParaRectificar} from 'src/app/model/bean/item-dpmn-para-rectificar.model';
import { BuscarRectiDpmnService } from 'src/app/services/buscar-recti-dpmn.service';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lista-dpmn-recti',
  templateUrl: './lista-dpmn-recti.component.html',
  styleUrls: ['./lista-dpmn-recti.component.css'],
  providers: [MessageService]
})
export class ListaDpmnRectiComponent implements OnInit {
  public rptaListaCtrlDpmns: Respuesta<ItemDpmnParaRectificar[]> = Respuesta.create(null, null);
  public lstDpmns: any[] = new Array();
  usuarioLogin = this.tokenAccesoService.origen;
  coUsuarioRegistroDPMN : String;
  actorRegistro: String;
  
  public lstDpmnsSelected: any[] = new Array();
  constructor(  private buscarRectiDpmnService : BuscarRectiDpmnService,
                private messageService: MessageService,
                private router:Router,
                private activatedRoute: ActivatedRoute,
                private tokenAccesoService: TokenAccesoService) {                   
                }

  ngOnInit(): void {
    this.cargarDpmns();   
  }

  
  private cargarDpmns() : void {   
    this.buscarRectiDpmnService.rptaBusqDcl$.subscribe((resultado : Respuesta<ItemDpmnParaRectificar[]>) =>{
      this.rptaListaCtrlDpmns= resultado;
    }, () => {
      this.configRespuestaConError();
    });
  }


  private configRespuestaConError() : void {
    this.rptaListaCtrlDpmns = Respuesta.create(null, Estado.ERROR);
    this.rptaListaCtrlDpmns.agregarMensaje(1, "Ha ocurrido un error")
  }

  continuarRectificaDpmn(item : ItemDpmnParaRectificar) : any {
    this.buscarRectiDpmnService.itemDpmn = item;
    console.log(this.buscarRectiDpmnService.itemDpmn);
    this.coUsuarioRegistroDPMN = item.auditoria.codUsuRegis;
    
    this.actorRegistro = item.actorRegistro.codDatacat;
    let esUsuarioExterno : boolean = this.actorRegistro == "UE";
    if (!esUsuarioExterno){
      this.messageService.add({ key: 'msj' , severity:"warn", summary: 'Mensaje',   detail: 'No puede rectificar una DPMN registrada por el funcionario aduanero'});
      return false;
    }

    let esMismoUsuario : boolean = this.coUsuarioRegistroDPMN == this.tokenAccesoService.login;
    if (!esMismoUsuario){
      this.messageService.add({ key: 'msj', severity:"warn", summary: 'Mensaje',   detail: 'No es posible rectificar una DPMN registrada por otro usuario'});
      return false;
    }

    
    return true;
  }

  irPageBusquedaInicial() {
		this.buscarRectiDpmnService.limpiarData();
		this.router.navigate(['../buscar-dpmn'], { relativeTo: this.activatedRoute });
  }


}
