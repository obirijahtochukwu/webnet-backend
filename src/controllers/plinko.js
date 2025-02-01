const { outcomes } = require("../utils");

const TOTAL_DROPS = 16;

const MULTIPLIERS = {
  0: 16,
  1: 9,
  2: 2,
  3: 1.4,
  4: 1.4,
  5: 1.2,
  6: 1.1,
  7: 1,
  8: 0.5,
  9: 1,
  10: 1.1,
  11: 1.2,
  12: 1.4,
  13: 1.4,
  14: 2,
  15: 9,
  16: 16,
};

const plinko = (req, res) => {
  let outcome = 0;
  const pattern = [];
  for (let i = 0; i < TOTAL_DROPS; i++) {
    if (Math.random() > 0.5) {
      pattern.push("R");
      outcome++;
    } else {
      pattern.push("L");
    }
  }
  console.log(outcome);

  const multiplier = MULTIPLIERS[outcome];
  const possiblieOutcomes = outcomes[outcome];

  res.send({
    point: possiblieOutcomes[Math.floor(Math.random() * possiblieOutcomes.length || 0)],
    multiplier,
    pattern,
  });
};

module.exports = { plinko };
