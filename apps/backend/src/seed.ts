import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './leads/entities/lead.entity';
import { User } from './users/entities/user.entity';
import { Property } from './properties/entities/property.entity';
import { Deal } from './deals/entities/deal.entity';
import { LeadStatus, LeadSource } from './leads/enums/lead.enum';
import { PropertyStatus, PropertyType } from './properties/enums/property.enum';
import { DealStage, DealPriority } from './deals/enums/deal.enum';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const leadRepo = app.get<Repository<Lead>>(getRepositoryToken(Lead));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const propRepo = app.get<Repository<Property>>(getRepositoryToken(Property));
  const dealRepo = app.get<Repository<Deal>>(getRepositoryToken(Deal));

  console.log('Cleaning up existing data...');
  try {
    await dealRepo.delete({});
  } catch (e) { }
  try {
    await leadRepo.delete({});
  } catch (e) { }
  try {
    await propRepo.delete({});
  } catch (e) { }

  console.log('Checking for users...');
  let agent = await userRepo.findOne({ where: {} });

  if (!agent) {
    console.log('No users found. Creating a default agent...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    agent = userRepo.create({
      email: 'agent@platinum.com',
      password: hashedPassword,
      name: 'Agent Smith',
      role: 'agent' as any,
      phone: '(555) 123-4567',
      whatsapp: '(555) 123-4568',
      officeAddress: '100 Platinum Plaza, Suite 500, Metropolis, NY 10001',
    });
    await userRepo.save(agent);
  }

  console.log(`Using agent: ${agent.name} (${agent.id})`);

  console.log('Adding properties...');
  const properties = [
    {
      title: 'Modern Downtown Loft',
      description: 'Stunning open-concept loft in the heart of the city with floor-to-ceiling windows and city views.',
      price: 850000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '123 Skyline Ave',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1450,
      yearBuilt: 2020,
      agent: agent,
      features: ['High Ceilings', 'City View', 'Concierge', 'Gym'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-001',
      rating: 4.5,
    },
    {
      title: 'Luxury Waterfront Villa',
      description: 'Private estate with breathtaking ocean views, infinity pool, and private dock.',
      price: 4500000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '45 Ocean Dr',
      city: 'Paradise Bay',
      state: 'FL',
      zipCode: '33101',
      bedrooms: 5,
      bathrooms: 6,
      sqft: 5200,
      lotSize: 12000,
      yearBuilt: 2019,
      agent: agent,
      features: ['Infinity Pool', 'Private Dock', 'Smart Home', 'Wine Cellar'],
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-002',
      rating: 4.8,
    },
    {
      title: 'Cozy Urban Studio',
      description: 'Perfect starter home in vibrant downtown location with modern amenities.',
      price: 325000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '88 Main St',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10002',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      yearBuilt: 2018,
      agent: agent,
      features: ['Updated Kitchen', 'In-Unit Laundry', 'Rooftop Deck'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154526-990addcee7bf?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-003',
      rating: 4.2,
    },
    {
      title: 'Spacious Family Home',
      description: 'Beautiful colonial with updated kitchen, finished basement, and large backyard.',
      price: 875000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '456 Oak Street',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      lotSize: 7500,
      yearBuilt: 1995,
      agent: agent,
      features: ['Updated Kitchen', 'Finished Basement', 'Backyard', 'Garage'],
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6981cf81c0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-004',
      rating: 4.6,
    },
    {
      title: 'Penthouse Suite',
      description: 'Luxurious penthouse with panoramic views, private terrace, and premium finishes throughout.',
      price: 2200000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.CONDO,
      address: '1 Tower Plaza',
      city: 'Manhattan',
      state: 'NY',
      zipCode: '10003',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2400,
      yearBuilt: 2021,
      agent: agent,
      features: ['Private Terrace', 'Concierge', 'Gym', 'Doorman'],
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600210492486-7247585a9f0a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-005',
      rating: 4.9,
    },
    {
      title: 'Charming Townhouse',
      description: 'Beautifully restored 3-story townhouse with exposed brick and private garden.',
      price: 975000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.TOWNHOUSE,
      address: '321 Heritage Lane',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11215',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2200,
      lotSize: 2000,
      yearBuilt: 1920,
      agent: agent,
      features: ['Exposed Brick', 'Private Garden', 'Original Hardwood', 'Fireplace'],
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154526-990addcee7bf?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-006',
      rating: 4.4,
    },
    {
      title: 'Modern Loft Living',
      description: 'Industrial-chic loft with soaring ceilings and exposed ductwork in converted building.',
      price: 695000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '500 Industrial Way',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11211',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1600,
      yearBuilt: 2015,
      agent: agent,
      features: ['Exposed Brick', 'High Ceilings', 'Chef Kitchen', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600210491892-03d54cc5a77d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6981cf81c0?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-007',
      rating: 4.3,
    },
    {
      title: 'Waterfront Condo',
      description: 'Stunning waterfront living with marina access and resort-style amenities.',
      price: 1150000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.CONDO,
      address: '789 Harbor View',
      city: 'Jersey City',
      state: 'NJ',
      zipCode: '07302',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1450,
      yearBuilt: 2017,
      agent: agent,
      features: ['Waterfront', 'Marina Access', 'Pool', 'Balcony'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566752225-6ed4a51a10c7?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-008',
      rating: 4.7,
    },
    {
      title: 'Historic Brownstone',
      description: 'Classic Brooklyn brownstone with modern updates and original details preserved.',
      price: 1650000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.TOWNHOUSE,
      address: '222 Bergen St',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11217',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3100,
      lotSize: 2500,
      yearBuilt: 1899,
      agent: agent,
      features: ['Original Details', 'Garden', 'Chef Kitchen', 'Finished Basement'],
      images: [
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154526-990addcee7bf?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-009',
      rating: 4.5,
    },
    {
      title: 'Suburban Ranch',
      description: 'Move-in ready ranch with updated kitchen, large backyard, and quiet street.',
      price: 545000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '789 Maple Ave',
      city: 'Hoboken',
      state: 'NJ',
      zipCode: '07030',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1650,
      lotSize: 6000,
      yearBuilt: 2005,
      agent: agent,
      features: ['Updated Kitchen', 'Garage', 'Backyard', 'Central AC'],
      images: [
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-010',
      rating: 4.1,
    },
    {
      title: 'Luxury High-Rise',
      description: 'Premium high-rise living with stunning skyline views and five-star amenities.',
      price: 1850000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.CONDO,
      address: '333 Luxury Tower',
      city: 'Manhattan',
      state: 'NY',
      zipCode: '10004',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 2022,
      agent: agent,
      features: ['Skyline Views', 'Concierge', 'Pool', 'Valet Parking'],
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-011',
      rating: 4.8,
    },
    {
      title: 'Starter Condo',
      description: 'Affordable entry into the city real estate market with great investment potential.',
      price: 385000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.CONDO,
      address: '66 First St',
      city: 'Queens',
      state: 'NY',
      zipCode: '11375',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 750,
      yearBuilt: 2010,
      agent: agent,
      features: ['Updated Kitchen', 'Laundry', 'Storage', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-012',
      rating: 4.0,
    },
    {
      title: 'Victorian Estate',
      description: 'Magnificent Victorian home with ornate details, wrap-around porch, and mature gardens.',
      price: 1250000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '444 Victorian Lane',
      city: 'Westfield',
      state: 'NJ',
      zipCode: '07090',
      bedrooms: 5,
      bathrooms: 4,
      sqft: 4200,
      lotSize: 15000,
      yearBuilt: 1890,
      agent: agent,
      features: ['Original Details', 'Wrap Porch', 'Mature Garden', 'Carriage House'],
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-013',
      rating: 4.6,
    },
    {
      title: 'Sleek Studio',
      description: 'Ultra-modern studio with Murphy bed system and custom built-ins.',
      price: 425000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '100 Urban Ave',
      city: 'Manhattan',
      state: 'NY',
      zipCode: '10005',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 550,
      yearBuilt: 2019,
      agent: agent,
      features: ['Murphy Bed', 'Custom Built-ins', 'Smart Home', 'Doorman'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-014',
      rating: 4.2,
    },
    {
      title: 'Garden Unit',
      description: 'Peaceful garden-level apartment with private outdoor space in boutique building.',
      price: 525000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '55 Garden Court',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 1100,
      yearBuilt: 1925,
      agent: agent,
      features: ['Private Garden', 'Updated Kitchen', 'Exposed Brick', 'Laundry'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6981cf81c0?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-015',
      rating: 4.4,
    },
    {
      title: 'Executive Estate',
      description: 'Grand executive home with pool, tennis court, and resort-style outdoor living.',
      price: 3500000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '777 Executive Dr',
      city: 'Great Falls',
      state: 'VA',
      zipCode: '22066',
      bedrooms: 6,
      bathrooms: 7,
      sqft: 8500,
      lotSize: 45000,
      yearBuilt: 2010,
      agent: agent,
      features: ['Pool', 'Tennis Court', 'Wine Cellar', 'Home Theater'],
      images: [
        'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-016',
      rating: 4.9,
    },
    {
      title: 'Arts District Loft',
      description: 'Creative loft in thriving arts district with gallery walls and industrial feel.',
      price: 725000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '200 Artist Way',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11221',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1700,
      yearBuilt: 2016,
      agent: agent,
      features: ['Gallery Walls', 'High Ceilings', 'Freight Elevator', 'Live/Work'],
      images: [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1618220179428-22790b461015?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1616594039964-ae9021a4000d?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-017',
      rating: 4.5,
    },
    {
      title: 'Classic Two-Bedroom',
      description: 'Well-maintained two-bedroom with original details and pre-war charm in doorman building.',
      price: 625000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.APARTMENT,
      address: '88 Prewar Pl',
      city: 'Manhattan',
      state: 'NY',
      zipCode: '10021',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 1100,
      yearBuilt: 1930,
      agent: agent,
      features: ['Pre-war Details', 'Doorman', 'Laundry', 'Storage'],
      images: [
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6981cf81c0?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-018',
      rating: 4.3,
    },
    {
      title: 'Investment Property',
      description: 'Multi-family investment property with excellent rental history and appreciation potential.',
      price: 1100000,
      status: PropertyStatus.AVAILABLE,
      type: PropertyType.HOUSE,
      address: '555 Investment Ave',
      city: 'Bronx',
      state: 'NY',
      zipCode: '10463',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2400,
      lotSize: 4000,
      yearBuilt: 1985,
      agent: agent,
      features: ['Multi-Family', 'Rental History', 'Parking', 'Yard'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
      ],
      mlsId: 'MLS-2024-019',
      rating: 4.1,
    }
  ];

  const savedProps: Property[] = [];
  for (const data of properties) {
    const prop = propRepo.create(data);
    const saved = await propRepo.save(prop);
    const savedProp = Array.isArray(saved) ? saved[0] : saved;
    savedProps.push(savedProp);
    console.log(`Added property: ${data.title}`);
  }

  // 2. Add Leads
  console.log('Adding leads...');
  const leads = [
    {
      name: 'Alice Freeman',
      email: 'alice@example.com',
      phone: '555-0101',
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      budget: 850000,
      location: 'Downtown',
      propertyType: 'Condo',
      assignedTo: agent,
    },
    {
      name: 'Bob Miller',
      email: 'bob@example.com',
      phone: '555-0102',
      status: LeadStatus.CONTACTED,
      source: LeadSource.REFERRAL,
      budget: 1200000,
      location: 'Suburbs',
      propertyType: 'Single Family Home',
      assignedTo: agent,
    },
  ];

  for (const data of leads) {
    const lead = leadRepo.create(data as any);
    await leadRepo.save(lead);
    console.log(`Added lead: ${data.name}`);
  }

  // 3. Add Deals
  console.log('Adding deals...');
  const deals = [
    {
      title: 'Downtown Loft Purchase',
      value: 850000,
      stage: DealStage.NEGOTIATION,
      priority: DealPriority.HIGH,
      customerName: 'Alice Freeman',
      customerEmail: 'alice@example.com',
      property: savedProps[0],
      agent: agent,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const data of deals) {
    const deal = dealRepo.create(data as any);
    await dealRepo.save(deal);
    console.log(`Added deal: ${data.title}`);
  }

  console.log('Seeding complete!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});