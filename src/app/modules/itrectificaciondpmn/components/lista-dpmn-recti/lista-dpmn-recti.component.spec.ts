import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDpmnRectiComponent } from './lista-dpmn-recti.component';

describe('ListaDpmnRectiComponent', () => {
  let component: ListaDpmnRectiComponent;
  let fixture: ComponentFixture<ListaDpmnRectiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaDpmnRectiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDpmnRectiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
