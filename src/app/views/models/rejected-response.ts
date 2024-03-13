import { ErrorResponse } from "../models/error-response";

export class RejectedResponse
{
  statusCode: number;
  message: string;
  errors: ErrorResponse[];

  constructor(rejected: any)
  {
    if (rejected)
    {
      this.statusCode = rejected.status;

      if (rejected.error)
      {
        let errorObj = rejected.error;

        if (errorObj.message)
        {
          this.message = errorObj.message;
        }

        this.errors = [];
        for (const error of errorObj.errors)
        {
          if (error.message)
            this.errors.push(new ErrorResponse(error.field, error.message));
        }
      }
    }
  }
}
