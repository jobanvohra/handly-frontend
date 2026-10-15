export const SERVICE_CATEGORIES = [
	{ value: 'plumber', label: 'Plumbing', description: 'Pipe repairs, leak detection, fixture installations' },
	{ value: 'electrician', label: 'Electrical', description: 'Wiring, panel upgrades, lighting, socket repairs' },
	{ value: 'cleaner', label: 'Cleaning & Maid', description: 'Deep home cleaning, office cleaning, sanitation' },
	{ value: 'carpenter', label: 'Carpentry', description: 'Furniture making, wood repair, framing, cabinets' },
	{ value: 'painter', label: 'Painting', description: 'Interior/exterior painting, touch-ups, wall design' },
	{ value: 'appliance-repair', label: 'Appliance Repair', description: 'Refrigerators, washing machines, microwaves' },
	{ value: 'pest-control', label: 'Pest Control', description: 'Termite inspection, bug extermination, prevention' },
	{ value: 'hvac', label: 'AC & Heating (HVAC)', description: 'Air conditioner servicing, duct cleaning, heating' },
	{ value: 'gardener', label: 'Gardening & Landscaping', description: 'Lawn mowing, hedge trimming, garden design' },
	{ value: 'tutor', label: 'Home Tutor', description: 'Academic tutoring, language lessons, test prep' },
	{ value: 'photographer', label: 'Photography', description: 'Events, portraits, commercial and family photos' },
	{ value: 'locksmith', label: 'Locksmith', description: 'Lock installation, key cutting, emergency unlock' },
] as const;

export type ServiceCategoryValue = (typeof SERVICE_CATEGORIES)[number]['value'];

export const ALLOWED_CATEGORY_VALUES = SERVICE_CATEGORIES.map((c) => c.value);

export const getCategoryLabel = (value: string): string => {
	const found = SERVICE_CATEGORIES.find((c) => c.value === value.toLowerCase());
	if (found) return found.label;
	return value.charAt(0).toUpperCase() + value.slice(1);
};
