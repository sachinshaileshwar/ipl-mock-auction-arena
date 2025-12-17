/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase specific errors
  if (err.code && err.message) {
    return res.status(400).json({
      error: err.message,
      code: err.code
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }

  // Default server error
  // Default server error
  res.status(500).json({
    // FORCE SHOW ERROR MESSAGE FOR DEBUGGING VERCEL DEPLOYMENT
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler };
