import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallStatus as CallStatusEnum } from '../../services/sip';

@Component({
  selector: 'app-call-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-status.html',
  styleUrl: './call-status.css'
})
export class CallStatusComponent {
  @Input() status: CallStatusEnum = CallStatusEnum.IDLE;
  
  get statusClass(): string {
    switch (this.status) {
      case CallStatusEnum.CONNECTING:
        return 'connecting';
      case CallStatusEnum.IN_CALL:
        return 'in-call';
      case CallStatusEnum.ENDED:
        return 'ended';
      case CallStatusEnum.ERROR:
        return 'error';
      default:
        return 'idle';
    }
  }
}
