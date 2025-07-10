import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { DialPadComponent } from './components/dial-pad/dial-pad.component';
import { CallStatusComponent } from './components/call-status/call-status.component';
import { SipConfigComponent } from './components/sip-config/sip-config.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminPanelComponent,
    DialPadComponent,
    CallStatusComponent,
    SipConfigComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  showAdminPanel = false;
  showSipConfig = false;
  customerName = '';
  customerNumber = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['admin'] === 'true') {
        this.showAdminPanel = true;
      }
      
      if (params['sip'] === 'true') {
        this.showSipConfig = true;
      }
      
      if (params['customerName']) {
        this.customerName = params['customerName'];
      }
      
      if (params['customerNumber']) {
        this.customerNumber = params['customerNumber'];
      }
    });
  }

  toggleAdminPanel(): void {
    this.showAdminPanel = !this.showAdminPanel;
    if (this.showAdminPanel) {
      this.showSipConfig = false;
    }
  }

  toggleSipConfig(): void {
    this.showSipConfig = !this.showSipConfig;
    if (this.showSipConfig) {
      this.showAdminPanel = false;
    }
  }
}