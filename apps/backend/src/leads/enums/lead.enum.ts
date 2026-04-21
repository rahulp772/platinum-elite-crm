export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  RNR = 'rnr',
  QUALIFIED = 'qualified',
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not_interested',
  SITE_VISIT_SCHEDULED = 'site_visit_scheduled',
  SITE_VISIT_DONE = 'site_visit_done',
  NEGOTIATION = 'negotiation',
  BOOKED = 'booked',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL = 'social',
  COLD_CALL = 'cold_call',
  EVENT = 'event',
  ACRES = '99acres',
  MAGICBRICKS = 'magicbricks',
  HOUSING = 'housing.com',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK = 'facebook',
  CHANNEL_PARTNER = 'channel_partner',
}

export enum LostReason {
  BUDGET = 'budget',
  LOCATION = 'location',
  BUILT_ELSEWHERE = 'bought_elsewhere',
  NOT_RESPONDING = 'not_responding',
  ALREADY_BOUGHT = 'already_bought',
  DELAYED = 'delayed',
  OTHER = 'other',
}

export enum PropertyType {
  ONE_BHK = '1 BHK',
  TWO_BHK = '2 BHK',
  THREE_BHK = '3 BHK',
  FOUR_BHK = '4 BHK',
  FIVE_BHK = '5 BHK',
  PENTHOUSE = 'Penthouse',
  PLOT = 'Plot',
  ROW_HOUSE = 'Row House',
  VILLA = 'Villa',
  APARTMENT = 'Apartment',
}