class apiError extends Error {
    constructor(
        Statuscode,
        message= "Something went wrong!",
        error= [],
        statck= ""
    ){
        super(message)
        this.Statuscode = Statuscode
        this.data= null
        this.message= message
        this.success= false;
        this.errors= this.errors

        if(statck) {
               this.statck = statck
        } else {
            Error.captureStackTrace(this.this.constructor)
        }
    }
}

export {apiError}