// src/redux/features/staticData/staticDataSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Define your static TRANSACTION_HEADS data here
const ALL_TRANSACTION_HEADS = [
  { value: 'ADVANCE', label: 'ADVANCE' },
  { value: 'ALLOWANCE', label: 'ALLOWANCE' },
  { value: 'ADMISSION FEE', label: 'ADMISSION' },
  { value: 'MEDICAL FEE', label: 'MEDICAL FEE' },
  { value: 'NSS', label: 'NSS' },
  { value: 'DONATION', label: 'DONATION' },
  { value: 'PU LIBRARY', label: 'PU LIBRARY' },
  { value: 'STUDENT UNION', label: 'STUDENT UNION' },
  { value: 'BANK INTEREST', label: 'BANK INTEREST' },
  { value: 'STATIONARIES', label: 'STATIONARIES' },
  { value: 'CLC', label: 'CLC' },
  { value: 'BONAFIDE', label: 'BONAFIDE' },
  { value: 'FIXED DEPOSIT', label: 'FIXED DEPOSIT' },
  { value: 'INTERNAL TRANSFER', label: 'INTERNAL TRANSFER' },
  { value: 'TEACHERS REMUNERATION', label: 'TEACHERS REMUNERATION' },
  { value: 'STAFF REMUNERATION', label: 'STAFF REMUNERATION' },
  { value: 'LEGAL CHARGES', label: 'LEGAL CHARGES' },
  { value: 'CONTINGENCY', label: 'CONTINGENCY' },
  { value: 'GARDEN & LAWN', label: 'GARDEN & LAWN' },
  { value: 'FUNCTION & CELEBRATION', label: 'FUNCTION & CELEBRATION' },
  { value: 'WEBSITE MAINTENANCE', label: 'WEBSITE MAINTENANCE' },
  { value: 'REPUBLIC & iNDEPENDANCE DAY', label: 'REPUBLIC & iNDEPENDANCE DAY' },
  { value: 'STUDY TOUR', label: 'STUDY TOUR' },
  { value: 'PATNA UNIVERSITY', label: 'PATNA UNIVERSITY' },
  { value: 'EXAMINATION PU', label: 'EXAMINATION PU' },
  { value: 'EXTERNAL EXAMINATION', label: 'EXTERNAL EXAMINATION' },
  { value: 'VENUE  CHARGES', label: 'VENUE  CHARGES' },
  { value: 'MERIT SCHOLARSHIP', label: 'MERIT SCHOLARSHIP' },
  { value: 'STUDENT REFUND', label: 'STUDENT REFUND' },
  { value: 'STUDENT LOAN BIHAR GOVT', label: 'STUDENT LOAN BIHAR GOVT' },
  { value: 'REIMBURSEMENT', label: 'REIMBURSEMENT' },
  { value: 'JOURNAL SUBSCRIPTION', label: 'RJOURNAL SUBSCRIPTION'},
  { value: 'ELECTRICITY', label: 'Electricity Bill' },
  { value: 'REMUNERATION_TEACHERS', label: 'Teachers Remuneration' },
  { value: 'SALARIES_OUTSOURCING_STAFF', label: 'SSALARIES_OUTSOURCING_STAFF' },
  { value: 'MAINTENANCE_BUILDING', label: 'Building Maintenance' },
  { value: 'LIBRARY_BOOKS', label: 'Library Books/Resources' },
  { value: 'LAB_EQUIPMENT', label: 'Lab Equipment Purchase' },
  { value: 'value: SPORTS_EQUIPMENT', label: 'Sports Equipment' },
  { value: 'SEMINAR/CONFERENCES', label:'SEMINAR/CONFERENCES' },
  { value: 'HOSTEL_EXPENSES', label: 'Hostel Operations/Maintenance' },
  { value: 'ADVERTISING_MARKETING', label: 'Advertising & Marketing' },
  { value: 'STUDENT_WELFARE', label: 'Student Welfare Activities' },
  { value: 'UTILITIES_WATER', label: 'Water Bill' },
  { value: 'TELEPHONE_INTERNET', label: 'Telephone & Internet Bills' },
  { value: 'TRANSPORTATION', label: 'Transportation Costs' },
  { value: 'EXAM_FEES_COLLECTION', label: 'Exam Fees Collection' },
  { value: 'ADMISSION_FEES_COLLECTION', label: 'Admission Fees Collection' },
  { value: 'DONATIONS_RECEIVED', label: 'Donations Received' },
  { value: 'BANK_INTEREST_EARNED', label: 'Bank Interest Earned' },
  { value: 'VENDOR_PAYMENT_SUPPLIES', label: 'Vendor Payment - Office Supplies' },
  { value: 'SECURITY_SERVICES', label: 'Security Services' },
  { value: 'AUDIT_FEES', label: 'Audit Fees' },
  { value: 'SCHOLARSHIPS_DISBURSED', label: 'Scholarships Disbursed' },
  { value: 'CULTURAL_EVENTS', label: 'Cultural Event Expenses' },
  { value: 'SPORTS_EVENTS', label: 'Sports Event Expenses' },
  { value: 'RENT_RECEIVED', label: 'Rent Received (Property/Facilities)' },
  { value: 'SEMINARS_WORKSHOPS', label: 'Seminars & Workshops Expenses' },
  { value: 'RESEARCH_GRANTS_RECEIVED', label: 'Research Grants Received' },
  { value: 'BANK_CHARGES', label: 'Bank Charges/Fees' },
  { value: 'STUDENT_FEES_TUITION', label: 'Student Tuition Fees' },
  { value: 'EQUIPMENT_REPAIR', label: 'Equipment Repair & Servicing' },
  { value: 'UNIFORM_PURCHASE', label: 'Uniform Purchase' },
  { value: 'PRINTING_STATIONERY', label: 'Printing & Stationery' },
  { value: 'GOVT_GRANTS_RECEIVED', label: 'Government Grants Received' },
  { value: 'TAX_PAYMENTS', label: 'Tax Payments' },
  { value: 'LOAN_REPAYMENT', label: 'Loan Repayment (Principal & Interest)' },
  { value: 'CONSTRUCTION_EXPENSES', label: 'New Construction/Renovation' },
  { value: 'OTHERS', label: 'OTHERS' },
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