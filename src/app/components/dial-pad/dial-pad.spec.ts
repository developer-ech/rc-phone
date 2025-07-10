import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialPad } from './dial-pad';

describe('DialPad', () => {
  let component: DialPad;
  let fixture: ComponentFixture<DialPad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialPad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialPad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
