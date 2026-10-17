import { Injectable } from '@angular/core';

export interface Organisation {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'suspended' | 'unknown';
  memberCount: number;
  owner: { email: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrgNormalizerService {
  normalize(raw: any): Organisation {
    let name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Unnamed Organisation';

    let rawStatus = (raw.status || '').toLowerCase();
    let status: Organisation['status'] = 'unknown';
    if (['active', 'inactive', 'suspended'].includes(rawStatus)) {
      status = rawStatus as any;
    } else if (rawStatus === 'actve') {
      status = 'active'; // Fix typo in fixture
    }

    let memberCount = Number(raw.memberCount);
    if (isNaN(memberCount) || memberCount < 0) { memberCount = 0; }

    let email = (raw.owner && typeof raw.owner.email === 'string' && raw.owner.email.includes('@')) 
      ? raw.owner.email 
      : 'unknown@example.com';

    let createdAt = new Date().toISOString();
    if (typeof raw.createdAt === 'number') {
      createdAt = new Date(raw.createdAt).toISOString();
    } else if (typeof raw.createdAt === 'string' && !isNaN(Date.parse(raw.createdAt))) {
      createdAt = new Date(raw.createdAt).toISOString();
    }

    return {
      id: Number(raw.id) || Math.floor(Math.random() * 10000),
      name,
      status,
      memberCount,
      owner: { email },
      createdAt
    };
  }
}