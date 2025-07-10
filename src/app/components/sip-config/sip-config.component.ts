import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SipService } from '../../services/sip.service';
import { SipConfig } from '../../models/sip-config.model';

@Component({
  selector: 'app-sip-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sip-config.component.html',
  styleUrls: ['./sip-config.component.css']
})
export class SipConfigComponent implements OnInit {
  sipForm: FormGroup;
  saveSuccess = false;
  saveError = false;
  useJwt = false;

  constructor(
    private fb: FormBuilder,
    private sipService: SipService
  ) {
    this.sipForm = this.fb.group({
      uri: ['', Validators.required],
      password: [''],
      wsServers: ['', Validators.required],
      displayName: [''],
      useJwt: [false],
      jwtToken: ['']
    });
  }

  ngOnInit(): void {
    // Load saved config if available
    const storedConfig = localStorage.getItem('sipConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        this.sipForm.patchValue(config);
        this.useJwt = config.useJwt || false;
      } catch (e) {
        console.error('Failed to parse stored SIP config', e);
      }
    }

    // Watch for changes to useJwt
    this.sipForm.get('useJwt')?.valueChanges.subscribe(value => {
      this.useJwt = value;
      
      if (value) {
        this.sipForm.get('password')?.clearValidators();
        this.sipForm.get('jwtToken')?.setValidators([Validators.required]);
      } else {
        this.sipForm.get('password')?.setValidators([Validators.required]);
        this.sipForm.get('jwtToken')?.clearValidators();
      }
      
      this.sipForm.get('password')?.updateValueAndValidity();
      this.sipForm.get('jwtToken')?.updateValueAndValidity();
    });
  }

  saveConfig(): void {
    if (this.sipForm.valid) {
      const config: SipConfig = this.sipForm.value;
      
      // Convert wsServers to array if it's a string
      if (typeof config.wsServers === 'string') {
        config.wsServers = [config.wsServers];
      }
      
      try {
        // Save to localStorage
        localStorage.setItem('sipConfig', JSON.stringify(config));
        
        // Initialize SIP service
        this.sipService.initialize(config);
        
        this.saveSuccess = true;
        this.saveError = false;
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      } catch (e) {
        console.error('Failed to initialize SIP service', e);
        this.saveError = true;
        this.saveSuccess = false;
      }
    }
  }
}