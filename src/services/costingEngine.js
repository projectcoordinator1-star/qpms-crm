export function calculateManpowerCost(row, survey = {}) {
  const basic = Number(row.basic || row.basicWage || 0);
  const da = Number(row.da || row.dearnessAllowance || 0);
  const grossSalary = basic + da;
  const pf = grossSalary * Number(survey.statutory?.pfPercent ?? 0.12);
  const esi = grossSalary * Number(survey.statutory?.esiPercent ?? 0.0325);
  const gratuity = grossSalary * Number(survey.statutory?.gratuityPercent ?? 0.0481);
  const leaveWage = grossSalary * Number(survey.statutory?.leaveWagePercent ?? 0.0481);
  const bonus = grossSalary * Number(survey.statutory?.bonusPercent ?? 0.0833);
  const reliever = row.relieverRequired === 'Yes' ? grossSalary * Number(survey.statutory?.relieverPercent ?? 0.167) : 0;
  const nfh = row.nfhApplicable === 'Yes' ? grossSalary / 26 : 0;
  const allowances = Number(row.allowanceCost || 0);
  const employerContribution = pf + esi + gratuity + leaveWage + bonus;
  const costBeforeFee = grossSalary + employerContribution + reliever + nfh + allowances;
  const managementFee = costBeforeFee * Number(survey.commercial?.managementFeePercent ?? 0.1);
  const finalBillableValue = costBeforeFee + managementFee;

  return {
    grossSalary,
    statutoryDeductions: pf + esi,
    employerContribution,
    relieverCost: reliever,
    nfh,
    managementFee,
    profitability: managementFee,
    finalBillableValue,
  };
}
