import { Component, OnInit } from '@angular/core';
import { BuscarRectiDpmnService } from 'src/app/services/buscar-recti-dpmn.service';

@Component({
  selector: 'app-lista-dpmn-recti',
  templateUrl: './lista-dpmn-recti.component.html',
  styleUrls: ['./lista-dpmn-recti.component.css'],
  providers: [BuscarRectiDpmnService]
})
export class ListaDpmnRectiComponent implements OnInit {

  constructor( private buscarRectiDpmnService : BuscarRectiDpmnService ) { }

  ngOnInit(): void {
  }

}
