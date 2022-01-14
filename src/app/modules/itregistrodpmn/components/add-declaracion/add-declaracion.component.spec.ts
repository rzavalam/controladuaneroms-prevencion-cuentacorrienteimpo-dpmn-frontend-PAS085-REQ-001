import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeclaracionComponent } from './add-declaracion.component';

describe('AddDeclaracionComponent', () => {
  let component: AddDeclaracionComponent;
  let fixture: ComponentFixture<AddDeclaracionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDeclaracionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDeclaracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
