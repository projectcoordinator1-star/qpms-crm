const proposalTemplatePath = 'C:/Users/Vignesh/Downloads/New Business Proposal Format.xlsx';

export function buildProposalRows(assessment) {
  const manpower = assessment?.survey?.manpowerPlan || [];
  const managementFee = Number(assessment?.survey?.commercial?.managementFee || assessment?.survey?.commercial?.management_fee || 0);

  return manpower.map((row) => {
    const quantity = Number(row.count || 0);
    const ratePerHead = Number(row.finalBillableValue || row.ratePerHead || 0);
    return {
      designation: row.designation || row.department || '',
      quantity,
      shift: row.shiftType || '',
      ratePerHead,
      monthlyTotal: quantity * ratePerHead,
      managementFee,
      contractValue: quantity * ratePerHead * 12,
    };
  });
}

export function getProposalTemplateMetadata() {
  return {
    templatePath: proposalTemplatePath,
    supportedExports: ['Excel', 'PDF'],
    workbookSheets: ['T&C', 'TCC List', 'Proposal commercial sheets'],
    status: 'Template mapped for proposal engine integration',
  };
}
