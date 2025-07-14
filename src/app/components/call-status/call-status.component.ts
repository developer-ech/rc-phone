import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SipService, CallStatus } from '../../services/sip.service';

@Component({
  selector: 'app-call-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-status.component.html',
  styleUrls: ['./call-status.component.css']
})
export class CallStatusComponent implements OnInit, OnDestroy {
  callStatus = CallStatus.IDLE;
  callDuration = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(private sipService: SipService) {}

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
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getStatusText(): string {
    switch (this.callStatus) {
      case CallStatus.IDLE:
        return 'Ready';
      case CallStatus.CONNECTING:
        return 'Connecting...';
      case CallStatus.IN_CALL:
        return 'In Call';
      case CallStatus.ENDED:
        return 'Call Ended';
      case CallStatus.FAILED:
        return 'Call Failed';
      default:
        return '';
    }
  }
}