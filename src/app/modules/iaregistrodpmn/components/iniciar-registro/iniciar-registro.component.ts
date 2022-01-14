import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { RegistroDpmnService } from '../../../../services/registro-dpmn.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PciDetalle } from 'src/app/model/bean/pci-detalle';

@Component({
  selector: 'app-iniciar-registro',
  templateUrl: './iniciar-registro.component.html',
  styleUrls: ['./iniciar-registro.component.css']
})
export class IniciarRegistroComponent implements OnInit {

  pasoActual : number = 1;

  controlPasoForm: FormGroup;

  constructor(private registroDpmnService: RegistroDpmnService,
              private formBuilder: FormBuilder,
              private cdRef:ChangeDetectorRef) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.registroDpmnService.pasoActual$.subscribe( (numPaso : number) => {
        this.pasoActual = numPaso;
        this.cdRef.detectChanges();
    });
    this.completarDatosControlPaso();
  }

  get txtNumControlPaso() : AbstractControl {
    return this.controlPasoForm.get("controlPaso") as FormControl;
  }

  get txtFechaRegistro() : AbstractControl {
    return this.controlPasoForm.get("fechaRegistro") as FormControl;
  }

  private buildForm() : void {
    this.controlPasoForm = this.formBuilder.group({
                                                    controlPaso: ['', [Validators.required]],
                                                    fechaRegistro: ['', [Validators.required]]
                                                  });
  }

  private completarDatosControlPaso() : void {
    let pci: PciDetalle = this.registroDpmnService.pciDetalle;

    if ( pci == null ) {
      return;
    }

    let numPciNew : string =  ('0000000000' + pci.numPci).slice(-10);

    let numCtrlPaso : string = pci?.aduana?.codDatacat + "-" + pci?.puestoControl?.codDatacat + "-" + pci.annPci + "-" + numPciNew;

    this.txtFechaRegistro.setValue(pci.fecInicioControl);
    this.txtNumControlPaso.setValue(numCtrlPaso);

  }

}
