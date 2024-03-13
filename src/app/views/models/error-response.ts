export class ErrorResponse
{
    static get default(): ErrorResponse
    {
        return new ErrorResponse(
            "",
            "Something went wrong. Please try again later."
        );
    }

    field: string;
    message: string;

    constructor(field: string, message: string)
    {
        this.field = field;
        this.message = message;
    }
}
