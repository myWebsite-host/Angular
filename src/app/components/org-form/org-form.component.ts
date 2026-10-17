import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Organisation } from '../../services/org-normalizer.service';

@Component({
  selector: 'app-org-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-card">
      <h2>Add New Organisation</h2>
      <p>Form under construction...</p>
      <button type="button" (click)="cancel.emit()">Cancel</button>
    </div>
  `,
  styles: [`
    .form-card { 
      background: white; 
      padding: 24px; 
      border-radius: 8px; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
      margin-bottom: 24px; 
      border: 1px solid var(--color-border); 
    }
    h2 { margin-top: 0; font-size: 1.25rem; margin-bottom: 16px; }
  `]
})
export class OrgFormComponent {
  @Input() existingOrgs: Organisation[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
}