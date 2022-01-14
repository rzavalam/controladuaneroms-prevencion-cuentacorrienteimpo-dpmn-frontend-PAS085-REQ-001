import { TestBed } from '@angular/core/testing';

import { PuestoControlService } from './puesto-control.service';

describe('PuestoControlService', () => {
  let service: PuestoControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuestoControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
