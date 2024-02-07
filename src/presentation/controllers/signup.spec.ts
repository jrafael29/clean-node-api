import {HttpRequest,HttpResponse} from '../protocols/http'
import {MissingParamError} from '../errors/missing-param-error'
import {badRequest} from '../helpers/http-helper'

class SignUpController{
    perform (httpRequest: HttpRequest): HttpResponse {

        if(!httpRequest.body.name){
            return badRequest(new MissingParamError('name'))
        }
        if(!httpRequest.body.email){
            return badRequest(new MissingParamError('email'))
        }
    }
}

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const httpRequest = {
            body: {
                email: "any_email@mail.com",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const sut = new SignUpController()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))

    })

    test('should return 400 if no name is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const sut = new SignUpController()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))

    })
})