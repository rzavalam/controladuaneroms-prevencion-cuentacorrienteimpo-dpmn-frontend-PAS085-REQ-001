import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosTransporteComponent } from './datos-transporte.component';

describe('DatosTransporteComponent', () => {
  let component: DatosTransporteComponent;
  let fixture: ComponentFixture<DatosTransporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosTransporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosTransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
