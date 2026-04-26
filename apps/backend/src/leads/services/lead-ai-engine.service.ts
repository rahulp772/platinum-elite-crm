import { Injectable } from '@nestjs/common';
import { Lead } from '../entities/lead.entity';
import { LeadStatus } from '../enums/lead.enum';

export interface AiSuggestion {
  suggestion: string;
  reason: string;
  action: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  ctaLabel: string;
}

@Injectable()
export class LeadAiEngineService {
  /**
   * Suggests the next best action for an agent based on the lead's current state.
   * Returns structured data including suggestion, reason, action type, priority, and CTA label.
   */
  suggestNextAction(lead: Lead): AiSuggestion {
    const now = new Date();
    const lastActivity = lead.lastActivityAt ? new Date(lead.lastActivityAt) : null;
    const followUp = lead.followUpAt ? new Date(lead.followUpAt) : null;
    const daysSinceLastContact = lastActivity 
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Check for SLA breach (leads with no activity for 24 hours)
    const isSlaBreached = !lastActivity && lead.createdAt && 
      (now.getTime() - new Date(lead.createdAt).getTime()) > 24 * 60 * 60 * 1000;

    // Check if follow-up is overdue
    const isFollowUpOverdue = followUp && followUp < now;

    // Check for long no response (7+ days)
    const isLongNoResponse = daysSinceLastContact !== null && daysSinceLastContact >= 7;

    // Check lead score/tier for priority boost
    const isHotLead = lead.score && lead.score >= 70;

    switch (lead.status) {
      case LeadStatus.NEW:
        if (isSlaBreached) {
          return {
            suggestion: 'Call immediately - SLA breached!',
            reason: 'No contact has been made within 24 hours. This lead is at high risk of conversion.',
            action: 'call',
            priority: 'urgent',
            ctaLabel: 'Call Now'
          };
        }
        return {
          suggestion: 'Contact the lead within 4 hours',
          reason: 'New leads have the highest conversion probability when contacted quickly.',
          action: lead.phone ? 'call' : 'note',
          priority: isHotLead ? 'urgent' : 'high',
          ctaLabel: 'Call Now'
        };

      case LeadStatus.CONTACTED:
        if (isLongNoResponse) {
          return {
            suggestion: 'Try reaching out via WhatsApp',
            reason: 'No response for 7+ days. Try a different communication channel.',
            action: 'whatsapp',
            priority: 'high',
            ctaLabel: 'Send WhatsApp'
          };
        }
        return {
          suggestion: 'Qualify the lead - confirm budget and preferences',
          reason: 'Gather more information to determine lead quality and match with properties.',
          action: 'note',
          priority: 'medium',
          ctaLabel: 'Add Note'
        };

      case LeadStatus.RNR:
        return {
          suggestion: 'Try a different time or channel',
          reason: 'Lead is not responding to calls. Try WhatsApp or schedule a callback.',
          action: 'whatsapp',
          priority: 'high',
          ctaLabel: 'Send WhatsApp'
        };

      case LeadStatus.QUALIFIED:
        if (lead.budgetMin && lead.budgetMax) {
          return {
            suggestion: 'Schedule a site visit with matching properties',
            reason: `Lead has budget ₹${(lead.budgetMin/100000).toFixed(0)}L - ₹${(lead.budgetMax/100000).toFixed(0)}L and is qualified. Match with available properties.`,
            action: 'schedule_visit',
            priority: 'high',
            ctaLabel: 'Schedule Visit'
          };
        }
        return {
          suggestion: 'Schedule a site visit',
          reason: 'Lead is qualified. Move them forward with a site visit.',
          action: 'schedule_visit',
          priority: 'high',
          ctaLabel: 'Schedule Visit'
        };

      case LeadStatus.SITE_VISIT_SCHEDULED:
        if (followUp && followUp.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
          return {
            suggestion: 'Send visit reminder 2 hours before',
            reason: 'Site visit is scheduled soon. Send reminder to confirm attendance.',
            action: 'whatsapp',
            priority: 'urgent',
            ctaLabel: 'Send Reminder'
          };
        }
        return {
          suggestion: 'Confirm the upcoming site visit',
          reason: 'Verify the lead is still confirmed for the scheduled visit.',
          action: 'call',
          priority: 'medium',
          ctaLabel: 'Confirm Visit'
        };

      case LeadStatus.SITE_VISIT_DONE:
        return {
          suggestion: 'Discuss visit feedback and start negotiation',
          reason: 'Visit completed. Gather feedback and discuss next steps or pricing.',
          action: 'call',
          priority: 'high',
          ctaLabel: 'Discuss Next Steps'
        };

      case LeadStatus.NEGOTIATION:
        return {
          suggestion: 'Push for closure - emphasize urgency',
          reason: 'Lead is in negotiation. Use scarcity tactics and close the deal.',
          action: 'call',
          priority: 'high',
          ctaLabel: 'Close Deal'
        };

      case LeadStatus.BOOKED:
        return {
          suggestion: 'Complete booking documentation',
          reason: 'Lead is booked. Ensure all paperwork and token amounts are collected.',
          action: 'note',
          priority: 'high',
          ctaLabel: 'Add Note'
        };

      case LeadStatus.LOST:
        return {
          suggestion: 'Add to nurture campaign',
          reason: 'Lead is lost but may revive. Add to long-term nurturing workflow.',
          action: 'note',
          priority: 'low',
          ctaLabel: 'Add Note'
        };

      default:
        return {
          suggestion: 'Review lead and determine next step',
          reason: 'Review the lead details and notes to decide on the next action.',
          action: 'note',
          priority: 'medium',
          ctaLabel: 'Review Lead'
        };
    }
  }
}