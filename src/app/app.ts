import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialPad } from './components/dial-pad/dial-pad';
import { CallStatusComponent } from './components/call-status/call-status';
import { SipConfigComponent } from './components/sip-config/sip-config';
import { SipService, CallStatus } from './services/sip';
import { SipConfig } from './models/sip-config.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DialPad, CallStatusComponent, SipConfigComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'RC Phone';
  callStatus = CallStatus.IDLE;
  
  constructor(private sipService: SipService) {
    this.sipService.callStatus$.subscribe(status => {
      this.callStatus = status;
    });
  }
  
  onConfigSubmit(config: SipConfig): void {
    this.sipService.initialize(config);
  }
  
  onDial(number: string): void {
    this.sipService.makeCall(number);
  }
  
  onHangup(): void {
    this.sipService.hangUp();
  }
}
