export interface LocationFilter {
  id: string;
  name: string;
  hindiName: string;
  queryTerm: string;
  type: 'all' | 'state' | 'city';
  stateGroup?: string;
}

export const LOCATION_FILTERS: LocationFilter[] = [
  { id: 'all-india', name: 'All India', hindiName: 'संपूर्ण भारत', queryTerm: 'India', type: 'all' },

  // Madhya Pradesh & Cities
  { id: 'mp', name: 'Madhya Pradesh', hindiName: 'मध्य प्रदेश', queryTerm: 'Madhya Pradesh', type: 'state', stateGroup: 'MP' },
  { id: 'bhopal', name: 'Bhopal', hindiName: 'भोपाल', queryTerm: 'Bhopal', type: 'city', stateGroup: 'MP' },
  { id: 'indore', name: 'Indore', hindiName: 'इंदौर', queryTerm: 'Indore', type: 'city', stateGroup: 'MP' },
  { id: 'gwalior', name: 'Gwalior', hindiName: 'ग्वालियर', queryTerm: 'Gwalior', type: 'city', stateGroup: 'MP' },
  { id: 'jabalpur', name: 'Jabalpur', hindiName: 'जबलपुर', queryTerm: 'Jabalpur', type: 'city', stateGroup: 'MP' },
  { id: 'ujjain', name: 'Ujjain', hindiName: 'उज्जैन', queryTerm: 'Ujjain', type: 'city', stateGroup: 'MP' },
  { id: 'rewa', name: 'Rewa', hindiName: 'रीवा', queryTerm: 'Rewa', type: 'city', stateGroup: 'MP' },
  { id: 'sagar', name: 'Sagar', hindiName: 'सागर', queryTerm: 'Sagar', type: 'city', stateGroup: 'MP' },

  // Maharashtra & Cities
  { id: 'maharashtra', name: 'Maharashtra', hindiName: 'महाराष्ट्र', queryTerm: 'Maharashtra', type: 'state', stateGroup: 'MH' },
  { id: 'mumbai', name: 'Mumbai', hindiName: 'मुंबई', queryTerm: 'Mumbai', type: 'city', stateGroup: 'MH' },
  { id: 'pune', name: 'Pune', hindiName: 'पुणे', queryTerm: 'Pune', type: 'city', stateGroup: 'MH' },
  { id: 'nagpur', name: 'Nagpur', hindiName: 'नागपुर', queryTerm: 'Nagpur', type: 'city', stateGroup: 'MH' },
  { id: 'nashik', name: 'Nashik', hindiName: 'नासिक', queryTerm: 'Nashik', type: 'city', stateGroup: 'MH' },

  // Other Key Indian States & Hubs
  { id: 'delhi', name: 'Delhi NCR', hindiName: 'दिल्ली', queryTerm: 'Delhi', type: 'state' },
  { id: 'up', name: 'Uttar Pradesh', hindiName: 'उत्तर प्रदेश', queryTerm: 'Uttar Pradesh', type: 'state' },
  { id: 'lucknow', name: 'Lucknow', hindiName: 'लखनऊ', queryTerm: 'Lucknow', type: 'city' },
  { id: 'rajasthan', name: 'Rajasthan', hindiName: 'राजस्थान', queryTerm: 'Rajasthan', type: 'state' },
  { id: 'jaipur', name: 'Jaipur', hindiName: 'जयपुर', queryTerm: 'Jaipur', type: 'city' },
  { id: 'bihar', name: 'Bihar', hindiName: 'बिहार', queryTerm: 'Bihar', type: 'state' },
  { id: 'patna', name: 'Patna', hindiName: 'पटना', queryTerm: 'Patna', type: 'city' },
  { id: 'gujarat', name: 'Gujarat', hindiName: 'गुजरात', queryTerm: 'Gujarat', type: 'state' },
  { id: 'ahmedabad', name: 'Ahmedabad', hindiName: 'अहमदाबाद', queryTerm: 'Ahmedabad', type: 'city' },
  { id: 'bengaluru', name: 'Bengaluru', hindiName: 'बेंगलुरु', queryTerm: 'Bengaluru', type: 'city' },
  { id: 'hyderabad', name: 'Hyderabad', hindiName: 'हैदराबाद', queryTerm: 'Hyderabad', type: 'city' },
];
