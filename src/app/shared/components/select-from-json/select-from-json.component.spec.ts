import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFromJsonComponent } from './select-from-json.component';

describe('SelectFromJsonComponent', () => {
  let component: SelectFromJsonComponent;
  let fixture: ComponentFixture<SelectFromJsonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFromJsonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFromJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
