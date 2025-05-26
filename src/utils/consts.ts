export const messages = {
    DB_CONNECTED: "Database has been connected successfully.",
    SERVER_FAILED_TO_START: "Failed to start server",
    SERVER_STARTED: "Server have been successfully started",
    SERVER_ERROR: "Sorry an internal server error occured, please try again.",
    UNAUTHORIZED: "Unauthorized request.",
    NOT_FOUND: "Resource not found",
    NETWORK_ERROR: "A network error occured, please try again.",
    OK : "Request Successful.",
    FORBIDDEN : "Access Forbidden.",
    JOB_NOT_FOUND : "Job not found.",
    KAFKA_CONSUMER_STARTED : "Kafka consumer has been started successfully.",
};

export enum request_methods {
    post = "POST",
    get = "GET",
}

export enum job_statuses{
    running="running",
    completed="completed",
    failed="failed",
    partially_completed="partially_completed"
}

export enum log_levels{
    warn="warn",
    error="error",
    info="info"
}

export enum kafka_topics{
    scrape_book_jobs="scrape_book_jobs"
}