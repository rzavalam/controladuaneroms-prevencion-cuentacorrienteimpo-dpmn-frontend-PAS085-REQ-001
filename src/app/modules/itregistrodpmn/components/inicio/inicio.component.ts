import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  pasoActual : number = 1;

  constructor(private registroDpmnService: RegistroDpmnService,
              private cdRef:ChangeDetectorRef) { }

  ngOnInit(): void {


    this.registroDpmnService.pasoActual$.subscribe( (numPaso : number) => {
        this.pasoActual = numPaso;
        this.cdRef.detectChanges();
    });
  }

}
