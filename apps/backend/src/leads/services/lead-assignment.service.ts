import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { User } from '../../users/entities/user.entity';
import { AgentProfile } from '../../users/entities/agent-profile.entity';
import { LeadTier } from '../enums/lead.enum';

@Injectable()
export class LeadAssignmentService {
  private readonly logger = new Logger(LeadAssignmentService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AgentProfile)
    private readonly agentProfileRepository: Repository<AgentProfile>,
  ) {}

  /**
   * Assigns an agent to a lead based on the lead's tier and agent profiles within the tenant.
   */
  async assignAgent(lead: Lead): Promise<string | null> {
    if (!lead.tenantId) {
      this.logger.warn(`Cannot assign lead ${lead.id} because it has no tenantId`);
      return null;
    }

    let agents = await this.userRepository.find({
      where: { tenantId: lead.tenantId },
      relations: ['role', 'agentProfile'],
    });

    const agentsWithProfiles: User[] = [];
    for (const agent of agents) {
      if (agent.role && agent.role.level <= 80) {
        if (!agent.agentProfile) {
          agent.agentProfile = await this.agentProfileRepository.save(
            this.agentProfileRepository.create({ userId: agent.id }),
          );
        }
        agentsWithProfiles.push(agent);
      }
    }

    if (agentsWithProfiles.length === 0) {
      this.logger.warn(`No available agents found for tenant ${lead.tenantId}`);
      return null;
    }

    const eligibleAgents = this.filterEligibleAgents(agentsWithProfiles, lead);

    if (eligibleAgents.length === 0) {
      return agentsWithProfiles[Math.floor(Math.random() * agentsWithProfiles.length)].id;
    }

    let selectedAgent: User | null = null;

    if (lead.tier === LeadTier.HIGH) {
      selectedAgent = this.getBestAgent(eligibleAgents);
    } else if (lead.tier === LeadTier.MEDIUM) {
      selectedAgent = this.getBalancedAgent(eligibleAgents);
    } else {
      selectedAgent = this.getJuniorAgent(eligibleAgents);
    }

    if (!selectedAgent) {
      selectedAgent = eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
    }

    return selectedAgent.id;
  }

  private filterEligibleAgents(agents: User[], lead: Lead): User[] {
    return agents.filter((agent) => {
      const profile = agent.agentProfile;
      if (!profile) return false;
      if (profile.locationSpecializations?.length) {
        const match = profile.locationSpecializations.some(
          (loc) =>
            loc.toLowerCase() === lead.preferredLocation?.toLowerCase() ||
            lead.preferredLocation?.toLowerCase().includes(loc.toLowerCase()),
        );
        if (!match) return false;
      }
      if (profile.budgetSpecializations?.length) {
        const budgetMid = ((lead.budgetMin || 0) + (lead.budgetMax || lead.budgetMin || 0)) / 2;
        const match = profile.budgetSpecializations.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return budgetMid >= min && budgetMid <= max;
        });
        if (!match) return false;
      }
      return true;
    });
  }

  private getBestAgent(agents: User[]): User | null {
    // Score = closingRate * 0.6 + (1 / (activeLeadCount + 1)) * 40
    let bestScore = -1;
    let bestAgent: User | null = null;

    for (const agent of agents) {
      const profile = agent.agentProfile;
      if (!profile) continue;

      const closingRate = Number(profile.closingRate) || 0;
      const availabilityScore = 1 / ((profile.activeLeadCount || 0) + 1);
      const score = (closingRate * 0.6) + (availabilityScore * 40);

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private getBalancedAgent(agents: User[]): User | null {
    // Weighted round-robin based on availability and a bit of performance
    // For MVP, select the agent with the lowest active lead count
    let lowestLoad = Infinity;
    let selectedAgent: User | null = null;

    for (const agent of agents) {
      if (!agent.agentProfile) continue;
      const load = agent.agentProfile.activeLeadCount || 0;
      if (load < lowestLoad) {
        lowestLoad = load;
        selectedAgent = agent;
      }
    }

    return selectedAgent;
  }

  private getJuniorAgent(agents: User[]): User | null {
    // Look for 'junior' experience level
    const juniors = agents.filter((a) => a.agentProfile?.experienceLevel === 'junior');
    if (juniors.length > 0) {
      return this.getBalancedAgent(juniors);
    }
    // Fallback to balanced if no juniors
    return this.getBalancedAgent(agents);
  }
}
