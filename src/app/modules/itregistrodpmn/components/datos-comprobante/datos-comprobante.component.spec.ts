import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosComprobanteComponent } from './datos-comprobante.component';

describe('DatosComprobanteComponent', () => {
  let component: DatosComprobanteComponent;
  let fixture: ComponentFixture<DatosComprobanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosComprobanteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
