import { Injectable } from '@nestjs/common';

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxProperties: number;
  maxLeads: number;
  features: string[];
  isPopular?: boolean;
  level: number;
}

@Injectable()
export class PlansService {
  private plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual agents starting their journey.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 2,
      maxProperties: 10,
      maxLeads: 50,
      features: [
        'Basic CRM',
        'Email Support',
        'Mobile App Access',
        'Up to 50 leads',
        'Up to 10 properties',
      ],
      isPopular: false,
      level: 0,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Designed for high-performing teams and agencies.',
      monthlyPrice: 49,
      yearlyPrice: 470,
      maxUsers: 10,
      maxProperties: 100,
      maxLeads: 500,
      features: [
        'Advanced CRM',
        'Priority Support',
        'Analytics Dashboard',
        'Team Collaboration',
        'Custom Workflows',
        'Up to 500 leads',
        'Up to 100 properties',
      ],
      isPopular: true,
      level: 1,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large-scale real estate firms.',
      monthlyPrice: 149,
      yearlyPrice: 1430,
      maxUsers: -1,
      maxProperties: -1,
      maxLeads: -1,
      features: [
        'White-label Branding',
        '24/7 Dedicated Support',
        'API Access',
        'Custom Integrations',
        'Advanced Security',
        'Unlimited Users',
        'Unlimited Leads',
        'Unlimited Properties',
      ],
      isPopular: false,
      level: 2,
    },
  ];

  findAll(): Plan[] {
    return this.plans;
  }

  findOne(id: string): Plan | undefined {
    return this.plans.find((plan) => plan.id === id);
  }
}
