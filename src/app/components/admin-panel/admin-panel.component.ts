import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RingCentralService } from '../../services/ringcentral.service';
import { RingCentralConfig } from '../../models/ringcentral-config.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  configForm: FormGroup;
  loginForm: FormGroup;
  isAuthenticated = false;
  showLoginForm = false;
  saveSuccess = false;
  saveError = false;
  loginSuccess = false;
  loginError = false;

  constructor(
    private fb: FormBuilder,
    private ringCentralService: RingCentralService
  ) {
    this.configForm = this.fb.group({
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required],
      serverUrl: ['https://platform.ringcentral.com', Validators.required]
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      extension: ['']
    });
  }

  ngOnInit(): void {
    // Load saved config if available
    const storedConfig = localStorage.getItem('ringcentralConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        this.configForm.patchValue({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          serverUrl: config.serverUrl
        });
      } catch (e) {
        console.error('Failed to parse stored config', e);
      }
    }

    // Subscribe to authentication status
    this.ringCentralService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.showLoginForm = false;
        }
      }
    );
  }

  saveConfig(): void {
    if (this.configForm.valid) {
      const config: RingCentralConfig = this.configForm.value;
      
      try {
        this.ringCentralService.initialize(config);
        this.saveSuccess = true;
        this.saveError = false;
        this.showLoginForm = true;
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      } catch (e) {
        console.error('Failed to initialize RingCentral SDK', e);
        this.saveError = true;
        this.saveSuccess = false;
      }
    }
  }

  async login(): Promise<void> {
    if (this.loginForm.valid) {
      const { username, password, extension } = this.loginForm.value;
      
      try {
        const success = await this.ringCentralService.login(username, password, extension);
        
        this.loginSuccess = success;
        this.loginError = !success;
        
        if (success) {
          // Reset success message after 3 seconds
          setTimeout(() => {
            this.loginSuccess = false;
          }, 3000);
        }
      } catch (e) {
        console.error('Login failed', e);
        this.loginError = true;
        this.loginSuccess = false;
      }
    }
  }

  logout(): void {
    this.ringCentralService.logout();
  }
}