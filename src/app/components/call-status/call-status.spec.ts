import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallStatus } from './call-status';

describe('CallStatus', () => {
  let component: CallStatus;
  let fixture: ComponentFixture<CallStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
