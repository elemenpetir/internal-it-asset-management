const calculateRiskScore = (assetData) => {
  const { purchase_date, maintenance_count, status, assignment_count } =
    assetData;

  const purchaseDate = new Date(purchase_date);
  const now = new Date();
  const ageInYears = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365);

  let age_score;
  if (ageInYears < 2) age_score = 5;
  else if (ageInYears <= 4) age_score = 15;
  else age_score = 30;

  let maintenance_score;
  if (maintenance_count === 0) maintenance_score = 0;
  else if (maintenance_count <= 2) maintenance_score = 15;
  else maintenance_score = 30;

  let status_score;
  if (status === "available" || status === "assigned") status_score = 0;
  else if (status === "under_maintenance") status_score = 20;
  else status_score = 40; // retired

  let assignment_score;
  if (assignment_count <= 2) assignment_score = 5;
  else if (assignment_count <= 5) assignment_score = 10;
  else assignment_score = 15;

  const risk_score =
    age_score + maintenance_score + status_score + assignment_score;

  let risk_level;
  if (risk_score <= 30) risk_level = "low";
  else if (risk_score <= 60) risk_level = "medium";
  else risk_level = "high";

  return { risk_score, risk_level };
};

module.exports = { calculateRiskScore };
