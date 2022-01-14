import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarControlPasoComponent } from './listar-control-paso.component';

describe('ListarControlPasoComponent', () => {
  let component: ListarControlPasoComponent;
  let fixture: ComponentFixture<ListarControlPasoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarControlPasoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarControlPasoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
