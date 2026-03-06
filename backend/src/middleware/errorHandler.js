const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;

  // Only log unexpected server errors (5xx), not operational 4xx errors
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] SERVER ERROR: ${err.stack || err.message}`);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ success: false, message: messages[0] });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  const message = err.isOperational ? err.message : 'Internal server error.';
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
