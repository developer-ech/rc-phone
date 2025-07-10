import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SipConfig } from './sip-config';

describe('SipConfig', () => {
  let component: SipConfig;
  let fixture: ComponentFixture<SipConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SipConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SipConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
