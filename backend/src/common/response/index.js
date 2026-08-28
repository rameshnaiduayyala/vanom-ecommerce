export class ApiResponse {
  static success(data = {}, meta = {}) {
    return {
      success: true,
      data,
      meta,
    };
  }

  static paginated(data = [], meta = {}) {
    return {
      success: true,
      data,
      meta,
    };
  }

  static error(code, message, details = null, requestId = null) {
    const res = {
      success: false,
      error: {
        code,
        message,
      },
    };
    if (details) {
      res.error.details = details;
    }
    if (requestId) {
      res.requestId = requestId;
    }
    return res;
  }
}
