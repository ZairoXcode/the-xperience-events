import {
  VendorCategory,
  VendorStatus,
  TaskStatus,
  TaskPriority,
  DeadlineStatus,
  RequirementStatus,
  RiskSeverity,
  RiskStatus,
} from '../types';

/**
 * Robust enum normalizers for AI and conversational inputs.
 * Gracefully maps natural language variations, casing anomalies,
 * and common synonyms to strict database enum schemas.
 */

export function normalizeVendorCategory(val?: unknown): VendorCategory {
  if (!val || typeof val !== 'string') return 'Other';
  const clean = val.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents like Décor -> Decor

  if (/decor|floral|florist|flower|stage|lighting|mandap|prop|styling/.test(clean)) {
    return 'Decoration';
  }
  if (/venue|resort|hall|banquet|lawn|location|place|hotel|property|palace/.test(clean)) {
    return 'Venue';
  }
  if (/cater|food|beverage|drinks|bar|dinner|lunch|buffet|meal|snack|chef/.test(clean)) {
    return 'Catering';
  }
  if (/photo|camera|video|film|cinemat|shoot|album/.test(clean)) {
    return 'Photography';
  }
  if (/entertain|dj|music|band|sound|audio|singer|anchor|emcee|mc|dance|performer|orchestra/.test(clean)) {
    return 'Entertainment';
  }
  if (/accommodat|stay|room|lodging|housing|residence/.test(clean)) {
    return 'Accommodation';
  }
  if (/transport|transit|cab|taxi|car|bus|coach|van|shuttle|travel|transfer|fleet/.test(clean)) {
    return 'Transportation';
  }
  if (/invit|invite|card|stationery|print/.test(clean)) {
    return 'Invitations';
  }

  // Exact enum check (case-insensitive)
  const canonical: VendorCategory[] = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Entertainment',
    'Accommodation',
    'Transportation',
    'Invitations',
    'Other',
  ];
  const found = canonical.find((c) => c.toLowerCase() === clean);
  return found || 'Other';
}

export function normalizeVendorStatus(val?: unknown): VendorStatus {
  if (!val || typeof val !== 'string') return 'PENDING';
  const clean = val.trim().toLowerCase();

  // 1. Pending / Unconfirmed takes precedence over substring matches (e.g. "pending confirmation")
  if (/pending|tentative|unconfirm|awaiting|to be confirm|need to confirm|yet to confirm|tbd|quote|quoting|shortlist|considering/.test(clean)) {
    return 'PENDING';
  }

  // 2. Unavailable / Declined
  if (/unavail|busy|declin|reject|booked out|fully booked|dropped out/.test(clean)) {
    return 'UNAVAILABLE';
  }

  // 3. Cancelled
  if (/cancel|terminat/.test(clean)) {
    return 'CANCELLED';
  }

  // 4. Contacted / In discussion
  if (/contact|discuss|negotiat|reach|talk|outreach/.test(clean)) {
    return 'CONTACTED';
  }

  // 5. Confirmed / Booked
  if (/confirm|book|finali[sz]|lock|hire|secur|sign|accept|approved/.test(clean)) {
    return 'CONFIRMED';
  }

  return 'PENDING';
}

export function normalizeTaskStatus(val?: unknown): TaskStatus {
  if (!val || typeof val !== 'string') return 'TODO';
  const clean = val.trim().toLowerCase();

  if (/complet|done|finish|resolv|closed/.test(clean)) {
    return 'COMPLETED';
  }
  if (/progress|doing|wip|active|ongoing|started|working/.test(clean)) {
    return 'IN_PROGRESS';
  }
  if (/block|stuck|wait|on hold|hold|pause/.test(clean)) {
    return 'BLOCKED';
  }
  if (/todo|to-do|to do|pending|open|not started|backlog|new/.test(clean)) {
    return 'TODO';
  }

  return 'TODO';
}

export function normalizeTaskPriority(val?: unknown): TaskPriority {
  if (!val || typeof val !== 'string') return 'MEDIUM';
  const clean = val.trim().toLowerCase();

  if (/critical|urgent|highest|p0|blocker|emergency|immediate/.test(clean)) {
    return 'CRITICAL';
  }
  if (/high|important|p1|major/.test(clean)) {
    return 'HIGH';
  }
  if (/low|minor|p3|optional|trivial/.test(clean)) {
    return 'LOW';
  }

  return 'MEDIUM';
}

export function normalizeDeadlineStatus(val?: unknown): DeadlineStatus {
  if (!val || typeof val !== 'string') return 'UPCOMING';
  const clean = val.trim().toLowerCase();

  if (/complet|done|finish|met/.test(clean)) {
    return 'COMPLETED';
  }
  if (/overdue|late|missed|delayed/.test(clean)) {
    return 'OVERDUE';
  }

  return 'UPCOMING';
}

export function normalizeRequirementStatus(val?: unknown): RequirementStatus {
  if (!val || typeof val !== 'string') return 'PENDING';
  const clean = val.trim().toLowerCase();

  if (/fulfill|complet|done|met|secur|booked|procured/.test(clean)) {
    return 'FULFILLED';
  }
  if (/progress|ongoing|sourcing|active/.test(clean)) {
    return 'IN_PROGRESS';
  }

  return 'PENDING';
}

export function normalizeRiskSeverity(val?: unknown): RiskSeverity {
  if (!val || typeof val !== 'string') return 'MEDIUM';
  const clean = val.trim().toLowerCase();

  if (/critical|severe|blocker|extreme/.test(clean)) {
    return 'CRITICAL';
  }
  if (/high|major|significant/.test(clean)) {
    return 'HIGH';
  }
  if (/low|minor|trivial/.test(clean)) {
    return 'LOW';
  }

  return 'MEDIUM';
}

export function normalizeRiskStatus(val?: unknown): RiskStatus {
  if (!val || typeof val !== 'string') return 'OPEN';
  const clean = val.trim().toLowerCase();

  if (/resolv|closed|fixed|mitigat/.test(clean)) {
    return 'RESOLVED';
  }
  if (/acknowledg|seen|review|in review|investigat/.test(clean)) {
    return 'ACKNOWLEDGED';
  }

  return 'OPEN';
}
