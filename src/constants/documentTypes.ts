export const DOCUMENT_CATEGORIES = {
    'Identity Proofs': [
        'PAN Card',
        'Aadhaar Card',
        'Voter ID',
        'Driving License',
        'Passport',
        'Birth Certificate'
    ],
    'Business Documents': [
        'GST Certificate',
        'Udyam Registration',
        'Shop Act License',
        'Incorporation Certificate',
        'Partnership Deed',
        'MOA/AOA',
        'Current Account Details'
    ],
    'Financial Documents': [
        'ITR Acknowledgement',
        'Balance Sheet',
        'Profit & Loss Statement',
        'Bank Statement',
        'Tax Audit Report',
        'Form 16/16A'
    ],
    'Property Documents': [
        'Rent Agreement',
        'Sale Deed',
        'Property Tax Receipt',
        'Electricity Bill',
        'Index II'
    ],
    'Legal & Others': [
        'Affidavit',
        'Power of Attorney',
        'Insurance Policy',
        'Vehicle RC',
        'Other'
    ]
} as const;

export type SuperCategory = keyof typeof DOCUMENT_CATEGORIES;
export type DocumentType = typeof DOCUMENT_CATEGORIES[SuperCategory][number];

export const getCategoryForType = (type: string): SuperCategory | 'Other' => {
    for (const [category, types] of Object.entries(DOCUMENT_CATEGORIES)) {
        if ((types as readonly string[]).includes(type)) {
            return category as SuperCategory;
        }
    }
    return 'Legal & Others';
};
