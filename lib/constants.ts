
export const SUPABASE_URL = 'https://jtohqxhfinqjspihturh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b2hxeGhmaW5xanNwaWh0dXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTkzNDgsImV4cCI6MjA3OTgzNTM0OH0.-XZbu74I7OtJ11tEnSUfgegGaWH0aGF0hyEXpqLJoV0';

export const SECTIONS = [
  'Admitting Section',
  'Ambulatory Care Medicine Complex',
  'Billing Section',
  'Cardiovascular Diagnostics',
  'Cashier Management',
  'Claims',
  'Emergency Room Complex',
  'Food and Nutrition Management',
  'General Services Section',
  'Health Records and Documents Management',
  'Housekeeping Laundry and Linen',
  'Industrial Clinic',
  'Information Technology',
  'Laboratory',
  'Medical Social Service',
  'Nursing Division',
  'Pathology',
  'Pharmacy',
  'Physical and Occupational Therapy',
  'Radiology',
  'Requisition Section',
  'Supply Management Section',
  'Surgical Care Complex'
];

export const IQA_USERS = [
  'Main IQA Account',
  'Ana Concepcion Biligan',
  'Bernadette Babanto',
  'Catherine Vibal',
  'Charisse Baga',
  'Gemma Alli',
  'Joanna Christina Santos',
  'Marieta Avila',
  'Max Angelo G. Terrenal',
  'Michelle Loraine Rimando',
  'Millicent Lumabao',
  'Richard Son Solito',
  'Rochelle Del Rosario',
  'Ruth Sagales',
  'Sharalyn Dasigan',
  'Teodorico Frigillana'
];

export const CREDENTIALS: Record<string, string> = {
  'Main IQA Account': 'admin123',
  'Ana Concepcion Biligan': 'Biligan123',
  'Bernadette Babanto': 'Babanto123',
  'Catherine Vibal': 'Vibal123',
  'Charisse Baga': 'Baga123',
  'Gemma Alli': 'Alli123',
  'Joanna Christina Santos': 'Santos123',
  'Marieta Avila': 'Avila123',
  'Max Angelo G. Terrenal': 'Terrenal123',
  'Michelle Loraine Rimando': 'Rimando123',
  'Millicent Lumabao': 'Lumabao123',
  'Richard Son Solito': 'Solito123',
  'Rochelle Del Rosario': 'DelRosario123',
  'Ruth Sagales': 'Sagales123',
  'Sharalyn Dasigan': 'Dasigan123',
  'Teodorico Frigillana': 'Frigillana123',
  'DEFAULT': 'osmak123' 
};

export const SOURCES = [
  'Internal Audit',
  'Incidents',
  'Complaints',
  'Nonconformities',
  'Applicable Law',
  'Management Review',
  'Process Review',
  'Performance Review',
  'Trends',
  'Others'
];

export const RISK_STRATEGIES: Record<string, { desc: string, ex: string }> = {
  'Avoid': { desc: 'Eliminate the hazard or discontinue the activity.', ex: 'Stop using a hazardous chemical.' },
  'Mitigate': { desc: 'Reduce the likelihood or severity of the risk.', ex: 'Install safeguards or training.' },
  'Accept': { desc: 'Acknowledge the risk and monitor it.', ex: 'Low risk activities where cost of mitigation exceeds benefit.' },
  'Transfer': { desc: 'Shift the risk to a third party.', ex: 'Insurance or outsourcing.' },
  'Exploit': { desc: 'Take advantage of a situation despite the risk (Positive Risk).', ex: 'Expediting a project launch.' },
  'Others': { desc: 'Other custom strategies.', ex: 'Please specify in description.' }
};

export const OPP_STRATEGIES: Record<string, { desc: string, ex: string }> = {
  'Exploit': { desc: 'Make the opportunity definitely happen.', ex: 'Assign top talent to a new project.' },
  'Enhance': { desc: 'Increase the probability or impact.', ex: 'Add more resources to finish early.' },
  'Share': { desc: 'Allocate ownership to a third party who can capture it.', ex: 'Joint venture or partnership.' },
  'Accept': { desc: 'Take advantage if it happens, but do not actively pursue.', ex: 'Wait for market conditions.' }
};

export const LIKELIHOOD_DESC: Record<number, string> = {
  1: 'Rare – may occur only in exceptional circumstances',
  2: 'Unlikely – could happen but not expected',
  3: 'Possible – might occur at some time',
  4: 'Likely – will probably occur in most circumstances',
  5: 'Almost Certain – expected to occur frequently'
};

export const SEVERITY_DESC: Record<number, string> = {
  1: 'Insignificant – no major effect on QMS or service',
  2: 'Minor – minor deviation, easily corrected',
  3: 'Moderate – affects process output or timelines',
  4: 'Major – causes service disruption or non-conformity',
  5: 'Critical – results in customer dissatisfaction or legal issue'
};
