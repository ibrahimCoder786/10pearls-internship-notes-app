/**
 * Centralized API Response Handler
 */
const responseHandler = {
  // Success (200 OK)
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  },

  // Created (201 Created)
  created: (res, data = null, message = 'Created successfully') => {
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message,
      data,
    });
  },

  // Error (Generic)
  error: (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  },

  // Not Found (404)
  notFound: (res, message = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message,
      data: null,
    });
  },

  // Unauthorized (401)
  unauthorized: (res, message = 'Unauthorized access') => {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message,
      data: null,
    });
  },

  // Validation Error (422)
  validationError: (res, errors) => {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors,
    });
  },
};

module.exports = responseHandler;