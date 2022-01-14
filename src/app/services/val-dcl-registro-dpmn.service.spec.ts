import { TestBed } from '@angular/core/testing';

import { ValDclRegistroDpmnService } from './val-dcl-registro-dpmn.service';

describe('ValDclRegistroDpmnService', () => {
  let service: ValDclRegistroDpmnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValDclRegistroDpmnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
