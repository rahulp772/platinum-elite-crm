import { Injectable } from '@nestjs/common';
import { Lead } from '../entities/lead.entity';
import { LeadStatus } from '../enums/lead.enum';

@Injectable()
export class LeadAiEngineService {
  /**
   * Suggests the next best action for an agent based on the lead's current state.
   */
  suggestNextAction(lead: Lead): string {
    switch (lead.status) {
      case LeadStatus.NEW:
        return 'Call immediately. Lead is new and requires first contact.';
      case LeadStatus.RNR:
        return 'Follow up with a WhatsApp message or try calling at a different time of day.';
      case LeadStatus.CONTACTED:
      case LeadStatus.INTERESTED:
        return 'Qualify the lead by confirming budget and location preferences.';
      case LeadStatus.QUALIFIED:
        return 'Schedule a site visit to the matching properties.';
      case LeadStatus.SITE_VISIT_SCHEDULED:
        return 'Send a reminder 2 hours before the site visit. Confirm arrival.';
      case LeadStatus.SITE_VISIT_DONE:
        return 'Discuss feedback from the visit and start price negotiations.';
      case LeadStatus.NEGOTIATION:
        return 'Push for closure. Emphasize scarcity and current offers.';
      case LeadStatus.BOOKED:
        return 'Ensure all booking documents and token amounts are collected.';
      case LeadStatus.LOST:
      case LeadStatus.NOT_INTERESTED:
        return 'Lead is lost. No further action needed right now. Add to nurturing campaign.';
      default:
        return 'Review lead notes and determine the next logical step.';
    }
  }
}
