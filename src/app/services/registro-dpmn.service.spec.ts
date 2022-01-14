import { TestBed } from '@angular/core/testing';

import { RegistroDpmnService } from './registro-dpmn.service';

describe('RegistroDpmnService', () => {
  let service: RegistroDpmnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroDpmnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
