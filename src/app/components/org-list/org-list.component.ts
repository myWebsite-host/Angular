import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrgService } from '../../services/org.service';
import { Organisation } from '../../services/org-normalizer.service';
import { OrgFormComponent } from '../org-form/org-form.component';

@Component({
  selector: 'app-org-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OrgFormComponent],
  template: `
    <div class="container">
      <header class="header">
        <h1>Organisation Directory</h1>
        <button class="btn-primary" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Cancel' : '+ Add Organisation' }}
        </button>
      </header>

      <!-- FR3: Create Form Modal / Card -->
      @if (showForm()) {
        <app-org-form [existingOrgs]="orgs()" (save)="onAddOrg($event)" (cancel)="showForm.set(false)" />
      }

      <!-- FR2: Search & Filter Controls -->
      <div class="controls">
        <input 
          type="text" 
          [ngModel]="searchQuery()" 
          (ngModelChange)="onSearchChange($event)" 
          placeholder="Search by name..." 
        />
        
        <select [ngModel]="statusFilter()" (ngModelChange)="onStatusChange($event)">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <!-- FR4: States Handling (Loading, Error, Content) -->
      @if (loading()) {
        <p class="state-msg">Loading organisations...</p>
      } @else if (error()) {
        <div class="error-box">
          <p>{{ error() }}</p>
          <button (click)="loadData()">Retry Request</button>
        </div>
      } @else {
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th (click)="toggleSort('name')">Name ↕</th>
                <th>Status</th>
                <th>Members</th>
                <th>Owner</th>
                <th (click)="toggleSort('date')">Created Date ↕</th>
              </tr>
            </thead>
            <tbody>
              @for (org of filteredOrganisations(); track $index) {
                <tr>
                  <td>{{ org.name }}</td>
                  <td>
                    <!-- Conflict 2 Resolution: Dot + Text Label for Accessibility -->
                    <span class="status-badge" [class]="org.status">
                      <span class="dot" aria-hidden="true"></span> 
                      <span class="label">{{ org.status }}</span>
                    </span>
                  </td>
                  <td>{{ org.memberCount }}</td>
                  <td>{{ org.owner.email }}</td>
                  <td>{{ org.createdAt | date:'shortDate' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty">No organisations found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .controls { display: flex; gap: 16px; margin-bottom: 24px; }
    input, select { padding: 10px 14px; font-size: 14px; border: 1px solid var(--color-border); border-radius: 6px; background: white; }
    input { flex: 1; }
    .table-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); font-size: 14px; }
    th { background: #f8fafc; cursor: pointer; font-weight: 600; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; text-transform: capitalize; font-weight: 500; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .active .dot { background: var(--color-success); }
    .inactive .dot { background: var(--color-text-muted); }
    .suspended .dot { background: var(--color-error); }
    .unknown .dot { background: var(--color-warning); }
    .error-box { padding: 24px; background: #fef2f2; color: var(--color-error); border-radius: 8px; border: 1px solid #fecaca; }
    .error-box button { margin-top: 10px; padding: 6px 12px; background: var(--color-error); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .state-msg, .empty { text-align: center; padding: 24px; color: var(--color-text-muted); }
  `]
})
export class OrgListComponent implements OnInit {
  private orgService = inject(OrgService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  orgs = signal<Organisation[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = signal<string>('');
  statusFilter = signal<string>('');
  sortField = signal<'name' | 'date'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  showForm = signal<boolean>(false);

  private searchDebounceTimer: any;

  ngOnInit() {
    // Read initial query params from URL (FR2 requirement)
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['status']) this.statusFilter.set(params['status']);
    });

    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    this.orgService.getOrganisations().subscribe({
      next: (data) => {
        this.orgs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load organisations. Please try again.');
        this.loading.set(false);
      }
    });
  }

  // FR2: Debounced Search update + URL sync
  onSearchChange(value: string) {
    this.searchQuery.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.updateUrlParams();
    }, 300); // 300ms debounce
  }

  // FR2: Status filter update + URL sync
  onStatusChange(value: string) {
    this.statusFilter.set(value);
    this.updateUrlParams();
  }

  // FR2: Helper to push filters to URL query parameters
  private updateUrlParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        status: this.statusFilter() || null
      },
      queryParamsHandling: 'merge'
    });
  }

  toggleSort(field: 'name' | 'date') {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  filteredOrganisations = computed(() => {
    let result = this.orgs().filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesStatus = this.statusFilter() ? org.status === this.statusFilter() : true;
      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
      let valA = this.sortField() === 'name' ? a.name : a.createdAt;
      let valB = this.sortField() === 'name' ? b.name : b.createdAt;
      let comparison = valA.localeCompare(valB);
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
  });

  onAddOrg(newOrgData: any) {
    this.orgService.addOrganisation(newOrgData).subscribe({
      next: (created) => {
        this.orgs.update(current => [created, ...current]);
        this.showForm.set(false);
      }
    });
  }
}