try {
    const app = require('../backend/src/server');
    module.exports = app;
} catch (error) {
    console.error("CRITICAL: Server failed to initialize", error);
    module.exports = (req, res) => {
        res.status(500).json({
            error: "Server Initialization Failed",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            hint: "Check Vercel logs for 'FUNCTION_INVOCATION_FAILED' details."
        });
    };
}
