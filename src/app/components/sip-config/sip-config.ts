import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SipConfig as SipConfigModel } from '../../models/sip-config.model';

@Component({
  selector: 'app-sip-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sip-config.html',
  styleUrl: './sip-config.css'
})
export class SipConfigComponent {
  @Output() configSubmit = new EventEmitter<SipConfigModel>();
  
  public config: SipConfigModel = {
    username: '',
    password: '',
    sipServer: '',
    wsServer: '',
    displayName: ''
  };
  
  public isConfigured = false;
  
  public saveConfig(): void {
    if (this.config.username && this.config.password && this.config.sipServer && this.config.wsServer) {
      this.configSubmit.emit(this.config);
      this.isConfigured = true;
    }
  }
  
  public editConfig(): void {
    this.isConfigured = false;
  }
}
