exports.handler = async (event) => {
  try {
    const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : event || {};
    const learnerId = payload.learnerId || 'unknown';
    const assessmentTaskId = payload.assessmentTaskId || payload.taskId || 'unknown';
    const subjectId = payload.subjectId || null;
    const teacherId = payload.teacherId || null;
    const score = Number(payload.score ?? 0);
    const maxScore = Number(payload.maxScore ?? 100);
    const grade = payload.grade || 'N/A';
    const remarks = payload.remarks || '';

    const normalizedScore = Number.isFinite(score) ? score : 0;
    const safeMaxScore = Number.isFinite(maxScore) && maxScore > 0 ? maxScore : 100;
    const percentage = safeMaxScore > 0 ? (normalizedScore / safeMaxScore) * 100 : 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learnerId,
        assessmentTaskId,
        subjectId,
        teacherId,
        score: normalizedScore,
        maxScore: safeMaxScore,
        percentage: Number(percentage.toFixed(2)),
        grade,
        remarks,
        academicStatus: percentage >= 70 ? 'on_track' : percentage >= 50 ? 'watchlist' : 'needs_support',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Invalid assessment submission payload',
        details: error.message,
      }),
    };
  }
};
