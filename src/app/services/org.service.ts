import { Injectable, inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Organisation, OrgNormalizerService } from './org-normalizer.service';

const RAW_FIXTURE = [
  { "id": 1,  "name": "Northwind Traders",     "status": "active", "memberCount": 42,   "owner": { "email": "ops@northwind.example" }, "createdAt": "2024-03-11T09:12:00Z" },
  { "id": 2,  "name": "",                       "status": "ACTIVE", "memberCount": "12", "owner": { "email": "a@b.example" }, "createdAt": 1710150720000 },
  { "id": 3,  "name": null,                     "status": "Active", "memberCount": -1,   "createdAt": "2024-01-02T00:00:00Z" },
  { "id": 42, "name": "Globex Corporation",     "status": "suspended", "memberCount": 7,    "owner": { "email": "hq@globex.example" }, "createdAt": "2023-11-30T14:45:10Z" },
  { "id": 42, "name": "Globex Corporation Ltd", "status": "actve", "memberCount": 7,    "owner": { "email": "hq@globex.example" }, "createdAt": "2023-11-30T14:45:10Z" },
  { "id": 6,  "name": "شركة الأمل 🚀",           "status": "active", "memberCount": 3,    "owner": { "email": "info@amal.example" }, "createdAt": "2025-06-01T08:00:00Z" },
  { "id": 7,  "name": "The Very Long Organisation Name...", "status": "inactive", "memberCount": 0, "owner": { "email": "long@example.com" }, "createdAt": "2024-07-19T16:20:00Z" },
  { "id": 8,  "name": "Initech",                "status": null, "memberCount": null, "owner": { "email": "not-an-email" }, "createdAt": "not a date" }
];

@Injectable({ providedIn: 'root' })
export class OrgService {
  private normalizer = inject(OrgNormalizerService);
  private organisations: Organisation[] = RAW_FIXTURE.map(item => this.normalizer.normalize(item));

  getOrganisations(): Observable<Organisation[]> {
    const delayMs = Math.floor(Math.random() * 500) + 400; // 400-900ms delay
    return timer(delayMs).pipe(
      switchMap(() => {
        if (Math.random() < 0.15) { // ~15% random failure rate
          return throwError(() => new Error('Simulated network request failed'));
        }
        return [this.organisations];
      })
    );
  }

  addOrganisation(newOrg: Omit<Organisation, 'id' | 'createdAt'>): Observable<Organisation> {
    const created: Organisation = {
      ...newOrg,
      id: Math.floor(Math.random() * 100000),
      createdAt: new Date().toISOString()
    };
    this.organisations = [created, ...this.organisations];
    return timer(300).pipe(map(() => created));
  }
}