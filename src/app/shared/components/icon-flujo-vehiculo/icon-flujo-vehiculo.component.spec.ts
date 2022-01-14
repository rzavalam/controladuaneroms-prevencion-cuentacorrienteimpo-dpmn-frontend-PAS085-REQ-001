import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconFlujoVehiculoComponent } from './icon-flujo-vehiculo.component';

describe('IconFlujoVehiculoComponent', () => {
  let component: IconFlujoVehiculoComponent;
  let fixture: ComponentFixture<IconFlujoVehiculoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconFlujoVehiculoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconFlujoVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
