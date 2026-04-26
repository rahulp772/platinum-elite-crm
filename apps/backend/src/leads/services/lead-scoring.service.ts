import { Injectable } from '@nestjs/common';
import { Lead } from '../entities/lead.entity';
import { LeadSource, LeadTier } from '../enums/lead.enum';

@Injectable()
export class LeadScoringService {
  /**
   * Evaluates a lead and returns the calculated score and tier.
   */
  evaluateLead(lead: Partial<Lead>): { score: number; tier: LeadTier } {
    let score = 0;

    // 1. Source Weight
    switch (lead.source) {
      case LeadSource.REFERRAL:
        score += 30;
        break;
      case LeadSource.WEBSITE:
      case LeadSource.GOOGLE_ADS:
        score += 20;
        break;
      case LeadSource.FACEBOOK:
      case LeadSource.SOCIAL:
        score += 10;
        break;
      case LeadSource.COLD_CALL:
        score += 5;
        break;
      default:
        score += 15;
    }

    // 2. Intent / Completeness
    if (lead.phone && lead.email) score += 10;
    if (lead.notes && lead.notes.length > 20) score += 10;
    if (lead.preferredLocation) score += 10;
    if (lead.propertyType) score += 10;

    // 3. Budget (Dynamic inference based on general High/Med/Low)
    // Assuming budget is in INR Lakhs/Crores. For now, simple ranges.
    // E.g. > 2 Cr = High (20000000)
    // 50L - 2 Cr = Medium
    // < 50L = Low
    const budget = lead.budgetMax || lead.budgetMin || 0;
    if (budget >= 20000000) {
      score += 30;
    } else if (budget >= 5000000) {
      score += 15;
    } else if (budget > 0) {
      score += 5;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine Tier
    let tier = LeadTier.LOW;
    if (score >= 70) {
      tier = LeadTier.HIGH;
    } else if (score >= 40) {
      tier = LeadTier.MEDIUM;
    }

    return { score, tier };
  }
}
