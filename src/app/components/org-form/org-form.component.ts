import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Organisation } from '../../services/org-normalizer.service';

@Component({
  selector: 'app-org-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dialog-backdrop">
      <div class="dialog-card">
        <div class="dialog-header">
          <h2>Add New Organisation</h2>
          <button type="button" class="btn-close" (click)="cancel.emit()">×</button>
        </div>
        
        <form [formGroup]="orgForm" (ngSubmit)="onSubmit()">
          <!-- Organisation Name -->
          <div class="form-group">
            <label>Organisation Name *</label>
            <input type="text" formControlName="name" placeholder="e.g. Acme Corp" />
            @if (orgForm.controls.name.touched && orgForm.controls.name.invalid) {
              <small class="error">
                @if (orgForm.controls.name.hasError('required')) { Organisation name is required. }
                @else if (orgForm.controls.name.hasError('minlength')) { Must be at least 3 characters. }
                @else if (orgForm.controls.name.hasError('maxlength')) { Cannot exceed 80 characters. }
                @else if (orgForm.controls.name.hasError('notUnique')) { This organisation name already exists (case-insensitive). }
              </small>
            }
          </div>

          <!-- Status -->
          <div class="form-group">
            <label>Status *</label>
            <select formControlName="status">
              <option value="" disabled>Select status...</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            @if (orgForm.controls.status.touched && orgForm.controls.status.invalid) {
              <small class="error">Status is required.</small>
            }
          </div>

          <!-- Owner Email -->
          <div class="form-group">
            <label>Owner Email *</label>
            <input type="email" formControlName="email" placeholder="ops@example.com" />
            @if (orgForm.controls.email.touched && orgForm.controls.email.invalid) {
              <small class="error">
                @if (orgForm.controls.email.hasError('required')) { Owner email is required. }
                @else { Please enter a valid email address. }
              </small>
            }
          </div>

          <!-- Member Count -->
          <div class="form-group">
            <label>Member Count</label>
            <input type="number" formControlName="memberCount" placeholder="0" min="0" />
            @if (orgForm.controls.memberCount.touched && orgForm.controls.memberCount.invalid) {
              <small class="error">Must be 0 or greater.</small>
            }
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="submit" [disabled]="orgForm.invalid" class="btn-submit">Save Organisation</button>
            <button type="button" (click)="cancel.emit()" class="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .dialog-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 480px;
      animation: fadeIn 0.2s ease-out;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h2 { margin: 0; font-size: 1.25rem; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-text-muted); }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    label { font-weight: 500; font-size: 0.875rem; }
    input, select { padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 14px; }
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched { border-color: var(--color-error); }
    .error { color: var(--color-error); font-size: 0.75rem; }
    .form-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
    .btn-submit { background: var(--color-primary); color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { background: #e2e8f0; color: var(--color-text); border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class OrgFormComponent {
  @Input() existingOrgs: Organisation[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(NonNullableFormBuilder);

  orgForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)], [this.uniqueNameValidator.bind(this)]],
    status: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    memberCount: [0, [Validators.min(0)]]
  });

  uniqueNameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valTrimmed = control.value.trim().toLowerCase();
    const exists = this.existingOrgs.some(org => org.name.trim().toLowerCase() === valTrimmed);
    return exists ? { notUnique: true } : null;
  }

  onSubmit() {
    if (this.orgForm.valid) {
      const val = this.orgForm.getRawValue();
      this.save.emit({
        name: val.name,
        status: val.status,
        memberCount: Number(val.memberCount) || 0,
        owner: { email: val.email }
      });
    }
  }
}