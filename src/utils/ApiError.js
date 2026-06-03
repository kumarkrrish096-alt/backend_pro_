// Create a custom error class that extends the built-in Error class
class ApiError extends Error {

    // Constructor runs whenever we create a new ApiError object
    constructor(
        statusCode,                        // HTTP status code (404, 500, 401, etc.)
        message = "Something went wrong",  // Default error message
        error = [],                        // Additional error details
        stack = ""                         // Optional custom stack trace
    ) {

        // Call the parent Error constructor
        // This sets the error message and gives us Error functionality
        super(message);

        // Store the HTTP status code
        this.statusCode = statusCode;

        // Usually used to send data back to the client
        // Since this is an error response, data is null
        this.data = null;

        // Store the error message
        this.message = message;

        // Indicate that the request was unsuccessful
        this.success = false;

        // Store additional error information
        this.error = error;

        // If a custom stack trace is provided, use it
        if (stack) {
            this.stack = stack;
        } else {

            // Otherwise generate a stack trace automatically
            // Stack trace shows where the error originated
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the class so it can be used in other files
export { ApiError };