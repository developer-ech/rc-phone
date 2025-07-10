import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dial-pad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dial-pad.html',
  styleUrl: './dial-pad.css'
})
export class DialPad {
  @Output() dial = new EventEmitter<string>();
  @Output() hangup = new EventEmitter<void>();
  
  public phoneNumber = '';
  public keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];
  
  public addDigit(digit: string): void {
    this.phoneNumber += digit;
  }
  
  public clearNumber(): void {
    this.phoneNumber = '';
  }
  
  public backspace(): void {
    this.phoneNumber = this.phoneNumber.slice(0, -1);
  }
  
  public makeCall(): void {
    if (this.phoneNumber.trim()) {
      this.dial.emit(this.phoneNumber);
    }
  }
  
  public endCall(): void {
    this.hangup.emit();
  }
}
