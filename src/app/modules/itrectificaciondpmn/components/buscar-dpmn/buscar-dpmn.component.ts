import { Component, OnInit } from '@angular/core';
import { BuscarRectiDpmnService } from 'src/app/services/buscar-recti-dpmn.service';

@Component({
  selector: 'app-buscar-dpmn',
  templateUrl: './buscar-dpmn.component.html',
  styleUrls: ['./buscar-dpmn.component.css'],
  providers: [BuscarRectiDpmnService]
})
export class BuscarDpmnComponent implements OnInit {

  constructor( private buscarRectiDpmnService : BuscarRectiDpmnService ) { }

  ngOnInit(): void {
  }

}
