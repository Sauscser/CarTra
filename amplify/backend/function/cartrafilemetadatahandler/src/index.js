exports.handler = async (event) => {
  try {
    const payload = typeof event?.body === 'string' ? JSON.parse(event.body) : event || {};
    const fileKey = payload.fileKey || payload.key || 'unknown';
    const fileName = payload.fileName || 'untitled';
    const fileType = payload.fileType || 'application/octet-stream';
    const learnerId = payload.learnerId || 'unknown';
    const uploadedByUserId = payload.uploadedByUserId || 'unknown';
    const materialType = payload.materialType || 'evidence';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey,
        fileName,
        fileType,
        learnerId,
        uploadedByUserId,
        materialType,
        isValid: Boolean(fileKey && fileName),
        storageType: 's3',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Invalid file metadata payload',
        details: error.message,
      }),
    };
  }
};
