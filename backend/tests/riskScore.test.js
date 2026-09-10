const { calculateRiskScore } = require("../src/utils/calculateRiskScore");

// T5: pure unit tests — no DB needed, boundaries follow PRD (low ≤30, medium ≤60, high 61+)
describe("RISK SCORE", () => {
  test("new healthy asset scores low", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2026-01-01",
      maintenance_count: 0,
      status: "available",
      assignment_count: 1,
    });
    // 5 + 0 + 0 + 5 = 10
    expect(risk_score).toBe(10);
    expect(risk_level).toBe("low");
  });

  test("exactly 30 is still low (boundary)", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2023-06-01",
      maintenance_count: 0,
      status: "assigned",
      assignment_count: 6,
    });
    // 15 + 0 + 0 + 15 = 30
    expect(risk_score).toBe(30);
    expect(risk_level).toBe("low");
  });

  test("35 is medium (just above low boundary)", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2023-06-01",
      maintenance_count: 2,
      status: "assigned",
      assignment_count: 1,
    });
    // 15 + 15 + 0 + 5 = 35
    expect(risk_score).toBe(35);
    expect(risk_level).toBe("medium");
  });

  test("exactly 60 is still medium (boundary)", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2023-06-01",
      maintenance_count: 0,
      status: "retired",
      assignment_count: 1,
    });
    // 15 + 0 + 40 + 5 = 60
    expect(risk_score).toBe(60);
    expect(risk_level).toBe("medium");
  });

  test("65 is high (just above medium boundary)", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2020-01-01",
      maintenance_count: 3,
      status: "assigned",
      assignment_count: 1,
    });
    // 30 + 30 + 0 + 5 = 65
    expect(risk_score).toBe(65);
    expect(risk_level).toBe("high");
  });

  test("old broken asset scores high", () => {
    const { risk_score, risk_level } = calculateRiskScore({
      purchase_date: "2020-01-01",
      maintenance_count: 3,
      status: "under_maintenance",
      assignment_count: 6,
    });
    // 30 + 30 + 20 + 15 = 95
    expect(risk_score).toBe(95);
    expect(risk_level).toBe("high");
  });
});
