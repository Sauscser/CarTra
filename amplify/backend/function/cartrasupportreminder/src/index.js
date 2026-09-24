exports.handler = async (event) => {
  try {
    const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : event || {};
    const learnerId = payload.learnerId || 'unknown';
    const dueDate = payload.dueDate || null;
    const status = payload.status || 'open';

    const now = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    const overdue = due ? due < now && status !== 'resolved' : false;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learnerId,
        dueDate,
        status,
        overdue,
        reminderState: overdue ? 'overdue' : 'on_track',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Invalid support reminder payload',
        details: error.message,
      }),
    };
  }
};
