import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarDpmnComponent } from './buscar-dpmn.component';

describe('BuscarDpmnComponent', () => {
  let component: BuscarDpmnComponent;
  let fixture: ComponentFixture<BuscarDpmnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarDpmnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarDpmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
