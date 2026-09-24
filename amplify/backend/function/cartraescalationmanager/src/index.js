exports.handler = async (event) => {
  try {
    const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : event || {};
    const learnerId = payload.learnerId || 'unknown';
    const currentDeviationPercent = Number(payload.currentDeviationPercent ?? 0);
    const previousEscalationLevel = payload.previousEscalationLevel || 'none';
    const jurisdictionCode = payload.jurisdictionCode || 'school';

    let escalationLevel = 'none';
    let reviewScope = 'teacher';

    if (currentDeviationPercent > 80) {
      escalationLevel = 'national';
      reviewScope = 'national';
    } else if (currentDeviationPercent > 60) {
      escalationLevel = 'regional';
      reviewScope = 'regional';
    } else if (currentDeviationPercent > 40) {
      escalationLevel = 'county';
      reviewScope = 'county';
    } else if (currentDeviationPercent > 20) {
      escalationLevel = 'sub_county';
      reviewScope = 'sub_county';
    } else if (currentDeviationPercent > 0) {
      escalationLevel = 'teacher';
      reviewScope = 'teacher';
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learnerId,
        currentDeviationPercent: Number(currentDeviationPercent.toFixed(2)),
        previousEscalationLevel,
        escalationLevel,
        reviewScope,
        jurisdictionCode,
        needsEscalation: escalationLevel !== 'none' && escalationLevel !== previousEscalationLevel,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Invalid escalation payload',
        details: error.message,
      }),
    };
  }
};
