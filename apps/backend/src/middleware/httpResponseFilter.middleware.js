export const httpResponseFilter = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    console.log(payload);
    
    // ❌ error responses untouched
    if (payload?.success === false) {
      return originalJson(payload);
    }

    // ApiResponse instance OR plain data
    const message = payload?.message ?? 'Success';
    const data =
      payload instanceof Object && 'data' in payload ? payload.data : payload;

    return originalJson({
      success: true,
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      data,
    });
  };

  next();
};
