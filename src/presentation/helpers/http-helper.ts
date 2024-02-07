import { MissingParamError } from "../errors/missing-param-error"
import { HttpResponse } from "../protocols/http"

export const badRequest = (error: Error): HttpResponse => {
    return {
        statusCode: 400,
        body: error
    }
}