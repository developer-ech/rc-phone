import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SipService, CallStatus } from '../../services/sip.service';
import { RingCentralService } from '../../services/ringcentral.service';

@Component({
  selector: 'app-dial-pad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dial-pad.component.html',
  styleUrls: ['./dial-pad.component.css']
})
export class DialPadComponent implements OnInit, OnDestroy {
  phoneNumber = '';
  customerName = '';
  callStatus = CallStatus.IDLE;
  callDuration = 0;
  isAuthenticated = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private sipService: SipService,
    private ringCentralService: RingCentralService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to call status
    this.subscriptions.push(
      this.sipService.callStatus$.subscribe(status => {
        this.callStatus = status;
      })
    );
    
    // Subscribe to call duration
    this.subscriptions.push(
      this.sipService.callDuration$.subscribe(duration => {
        this.callDuration = duration;
      })
    );
    
    // Subscribe to authentication status
    this.subscriptions.push(
      this.ringCentralService.isAuthenticated$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      })
    );
    
    // Subscribe to SIP config
    this.subscriptions.push(
      this.ringCentralService.sipConfig$.subscribe(config => {
        if (config) {
          this.sipService.initialize(config);
        }
      })
    );
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['customerNumber']) {
        this.phoneNumber = params['customerNumber'];
      }
      
      if (params['customerName']) {
        this.customerName = params['customerName'];
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Terminate SIP service
    this.sipService.terminate();
  }

  onDigitClick(digit: string): void {
    if (this.callStatus === CallStatus.IDLE || this.callStatus === CallStatus.ENDED || this.callStatus === CallStatus.FAILED) {
      this.phoneNumber += digit;
    }
  }

  onBackspaceClick(): void {
    if (this.phoneNumber.length > 0 && 
        (this.callStatus === CallStatus.IDLE || this.callStatus === CallStatus.ENDED || this.callStatus === CallStatus.FAILED)) {
      this.phoneNumber = this.phoneNumber.slice(0, -1);
    }
  }

  onCallClick(): void {
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      return;
    }
    
    if (this.callStatus === CallStatus.IDLE || this.callStatus === CallStatus.ENDED || this.callStatus === CallStatus.FAILED) {
      this.sipService.makeCall(this.phoneNumber);
    }
  }

  onHangupClick(): void {
    if (this.callStatus === CallStatus.CONNECTING || this.callStatus === CallStatus.IN_CALL) {
      this.sipService.hangUp();
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getCallStatusText(): string {
    switch (this.callStatus) {
      case CallStatus.IDLE:
        return 'Ready';
      case CallStatus.CONNECTING:
        return 'Connecting...';
      case CallStatus.IN_CALL:
        return `In Call (${this.formatDuration(this.callDuration)})`;
      case CallStatus.ENDED:
        return 'Call Ended';
      case CallStatus.FAILED:
        return 'Call Failed';
      default:
        return '';
    }
  }

  isCallActive(): boolean {
    return this.callStatus === CallStatus.CONNECTING || this.callStatus === CallStatus.IN_CALL;
  }
}