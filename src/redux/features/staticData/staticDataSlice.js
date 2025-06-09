// src/redux/features/staticData/staticDataSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Define your static ALL_TRANSACTION_HEADS data here, consolidated and cleaned
const ALL_TRANSACTION_HEADS = [
  { value: 'ADMISSION_FEES_COLLECTION', label: 'Admission Fees Collection' },
  { value: 'ADVANCE', label: 'Advance' },
  { value: 'ADVERTISING_MARKETING', label: 'Advertising & Marketing' },
  { value: 'ALLOWANCE', label: 'Allowance' },
  { value: 'AUDIT_FEES', label: 'Audit Fees' },
  { value: 'BANK_CHARGES', label: 'Bank Charges/Fees' },
  { value: 'BANK_INTEREST_EARNED', label: 'Bank Interest Earned' },
  { value: 'BONAFIDE', label: 'Bonafide' },
  { value: 'CLC', label: 'CLC' },
  { value: 'CONSTRUCTION_EXPENSES', label: 'New Construction/Renovation' },
  { value: 'CONTINGENCY', label: 'Contingency' },
  { value: 'CULTURAL_EVENTS', label: 'Cultural Event Expenses' },
  { value: 'DONATIONS_RECEIVED', label: 'Donations Received' },
  { value: 'ELECTRICITY', label: 'Electricity Bill' },
  { value: 'EQUIPMENT_REPAIR', label: 'Equipment Repair & Servicing' },
  { value: 'EXAM_FEES_COLLECTION', label: 'Exam Fees Collection' },
  { value: 'EXTERNAL_EXAMINATION', label: 'External Examination' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit' },
  { value: 'FUNCTION_CELEBRATION', label: 'Function & Celebration' },
  { value: 'GARDEN_LAWN', label: 'Garden & Lawn' },
  { value: 'GOVT_GRANTS_RECEIVED', label: 'Government Grants Received' },
  { value: 'HOSTEL_EXPENSES', label: 'Hostel Operations/Maintenance' },
  { value: 'INTERNAL_TRANSFER', label: 'Internal Transfer' },
  { value: 'JOURNAL_SUBSCRIPTION', label: 'Journal Subscription' },
  { value: 'LAB_EQUIPMENT', label: 'Lab Equipment Purchase' },
  { value: 'LEGAL_CHARGES', label: 'Legal Charges' },
  { value: 'LIBRARY_BOOKS', label: 'Library Books/Resources' },
  { value: 'LOAN_REPAYMENT', label: 'Loan Repayment (Principal & Interest)' },
  { value: 'MAINTENANCE_BUILDING', label: 'Building Maintenance' },
  { value: 'MEDICAL_FEE', label: 'Medical Fee' },
  { value: 'MERIT_SCHOLARSHIP', label: 'Merit Scholarship' },
  { value: 'NSS', label: 'NSS' },
  { value: 'OTHERS', label: 'Others' },
  { value: 'PATNA_UNIVERSITY', label: 'Patna University' },
  { value: 'PRINTING_STATIONERY', label: 'Printing & Stationery' },
  { value: 'PU_LIBRARY', label: 'PU Library' },
  { value: 'REFRESHMENT', label: 'REFRESHMENT' },
  { value: 'REIMBURSEMENT', label: 'Reimbursement' },
  { value: 'REMUNERATION_TEACHERS', label: 'Teachers Remuneration' },
  { value: 'RENT_RECEIVED', label: 'Rent Received (Property/Facilities)' },
  { value: 'REPUBLIC_INDEPENDENCE_DAY', label: 'Republic & Independence Day' },
  { value: 'RESEARCH_GRANTS_RECEIVED', label: 'Research Grants Received' },
  { value: 'SALARIES_OUTSOURCING_STAFF', label: 'Salaries Outsourcing Staff' },
  { value: 'SALARIES_STAFF', label: 'Staff Salaries' },
  { value: 'SCHOLARSHIPS_DISBURSED', label: 'Scholarships Disbursed' },
  { value: 'SECURITY_SERVICES', label: 'Security Services' },
  { value: 'SEMINARS_CONFERENCES', label: 'Seminars/Conferences' },
  { value: 'SEMINARS_WORKSHOPS', label: 'Seminars & Workshops Expenses' },
  { value: 'SPORTS_EQUIPMENT', label: 'Sports Equipment' },
  { value: 'SPORTS_EVENTS', label: 'Sports Event Expenses' },
  { value: 'STUDENT_FEES_TUITION', label: 'Student Tuition Fees' },
  { value: 'STUDENT_LOAN_BIHAR_GOVT', label: 'Student Loan Bihar Govt' },
  { value: 'STUDENT_REFUND', label: 'Student Refund' },
  { value: 'STUDENT_UNION', label: 'Student Union' },
  { value: 'STUDENT_WELFARE', label: 'Student Welfare Activities' },
  { value: 'STUDY_TOUR', label: 'Study Tour' },
  { value: 'TAX_PAYMENTS', label: 'Tax Payments' },
  { value: 'TELEPHONE_INTERNET', label: 'Telephone & Internet Bills' },
  { value: 'TRANSPORTATION', label: 'Transportation Costs' },
  { value: 'UNIFORM_PURCHASE', label: 'Uniform Purchase' },
  { value: 'UTILITIES_WATER', label: 'Water Bill' },
  { value: 'VENUE_CHARGES', label: 'Venue Charges' },
  { value: 'WEBSITE_MAINTENANCE', label: 'Website Maintenance' },
];


const initialState = {
  transactionHeads: ALL_TRANSACTION_HEADS,
  // You can add other static data here if needed, e.g., currencies, user roles, etc.
};

const staticDataSlice = createSlice({
  name: 'staticData',
  initialState,
  reducers: {
    // No reducers needed if this data is truly static and never changes
    // If you ever needed to update it, you'd add reducers here.
  },
});

// Selector to get all transaction heads (unsorted)
export const selectAllTransactionHeads = (state) => state.staticData.transactionHeads;

// Selector to get transaction heads sorted alphabetically by label
export const selectSortedTransactionHeads = (state) =>
  [...state.staticData.transactionHeads].sort((a, b) => a.label.localeCompare(b.label));

export default staticDataSlice.reducer;