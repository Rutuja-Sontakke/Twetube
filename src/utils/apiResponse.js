class apiRespinse {
    constructor(statusCode, data, message = "success") {
        this.statusCode = statusCode
        this.data
        this.message = message
        this.success = statusCode < 400
    }
}