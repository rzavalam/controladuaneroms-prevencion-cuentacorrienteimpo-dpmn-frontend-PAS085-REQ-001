import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenAccesoService } from './services/token-acceso.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'controladuaneroms-prevencion-cuentacorrienteimpo-dpmn-frontend';

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private tokenAccesoService: TokenAccesoService,) { }

  ngOnInit(): void {
    this.activateRoute.queryParams
    .subscribe(params => {
        let noHayToken : boolean = params.token == null;
        let noHayModulo : boolean = params.modulo == null;

        if ( noHayToken ) {
          return;
        }

        this.tokenAccesoService.guardarTokenSession(params.token);

        if ( noHayModulo ) {
          this.router.navigate(['/itregistrodpmn/datos-transporte']);
          return;
        }

        if ( params.modulo == 'iaregistrodpmn' ) {
          this.router.navigate(['/iaregistrodpmn/listar-control-paso']);
        }

        if ( params.modulo == 'itrectificaciondpmn' ) {
          this.router.navigate(['/itrectificaciondpmn/buscar-dpmn']);
        }
      }
    );
  }
}
