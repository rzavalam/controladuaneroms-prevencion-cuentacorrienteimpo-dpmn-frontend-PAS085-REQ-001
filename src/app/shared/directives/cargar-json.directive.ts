import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Directive({
  selector: '[appCargarJson]'
})
export class CargarJsonDirective implements OnInit  {
  @Input() ruta: string;
  @Input() mostrarCodigo: boolean = true;
  @Input() valorInicial: string = "";

  private datosJson: any;

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private httpClient: HttpClient) { }

  ngOnInit() {
    this.cargarJson();
  }

  private cargarJson() {
    this.httpClient.get<any>(this.ruta).subscribe((data)=>
      {
        this.datosJson = data;
        this.completarData();
      }
    );
  }

  private completarData() {
    var option = this.renderer.createElement('option');
    option.selected = true;
    this.renderer.appendChild(option, this.renderer.createText(""));

    this.renderer.appendChild(this.el.nativeElement, option);

    this.datosJson?.forEach(element => {
      option = this.renderer.createElement('option');
      this.renderer.setAttribute(option, "value", element.codigo);

      if ( this.mostrarCodigo == true ) {
        this.renderer.appendChild(option, this.renderer.createText(element.codigo + " - " + element.descripcion));
      } else {
        this.renderer.appendChild(option, this.renderer.createText(element.descripcion));
      }

      if ( this.valorInicial == element.codigo ) {
        this.renderer.setAttribute(option, "selected", "selected");
      }

      this.renderer.appendChild(this.el.nativeElement, option);
    });
  }

}
