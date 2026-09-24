


/**
 * CarTra learner deviation calculator
 *
 * Input shape can be either:
 * 1) direct object: { target: 80, achieved: 60, learnerId: 'L-001' }
 * 2) API Gateway event with body JSON: { body: '{"target":80,"achieved":60}' }
 */
exports.handler = async (event) => {
  try {
    const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : event || {};
    const target = Number(payload.target ?? payload.setTarget ?? 0);
    const achieved = Number(payload.achieved ?? payload.achievedTarget ?? 0);
    const learnerId = payload.learnerId || payload.userId || 'unknown';

    const safeTarget = Number.isFinite(target) ? target : 0;
    const safeAchieved = Number.isFinite(achieved) ? achieved : 0;

    let deviationPercent = 0;
    let riskBand = 'on_track';
    let escalationLevel = 'none';

    if (safeTarget > 0) {
      deviationPercent = ((safeTarget - safeAchieved) / safeTarget) * 100;
    }

    if (deviationPercent > 80) {
      riskBand = 'national_review';
      escalationLevel = 'national';
    } else if (deviationPercent > 60) {
      riskBand = 'regional_review';
      escalationLevel = 'regional';
    } else if (deviationPercent > 40) {
      riskBand = 'county_review';
      escalationLevel = 'county';
    } else if (deviationPercent > 20) {
      riskBand = 'sub_county_review';
      escalationLevel = 'sub_county';
    } else if (deviationPercent > 0) {
      riskBand = 'mild_risk';
      escalationLevel = 'teacher_review';
    } else {
      riskBand = 'on_track';
      escalationLevel = 'none';
    }

    const result = {
      learnerId,
      target: safeTarget,
      achieved: safeAchieved,
      deviationPercent: Number(deviationPercent.toFixed(2)),
      riskBand,
      escalationLevel,
      thresholds: {
        subCounty: 20,
        county: 40,
        regional: 60,
        national: 80,
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Invalid learner deviation payload',
        details: error.message,
      }),
    };
  }
};
