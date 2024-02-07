import {HttpRequest,HttpResponse} from '../protocols/http'
import {MissingParamError} from '../errors/missing-param-error'
import {badRequest} from '../helpers/http-helper'
import { Controller } from '../protocols/controller';
import { InvalidParamError } from '../errors/invalid-param-error';
import { EmailValidator } from '../protocols/email-validator';

class SignUpController implements Controller{
    private readonly emailValidator: EmailValidator
    constructor(emailValidator: EmailValidator){
        this.emailValidator = emailValidator
    }
    perform (httpRequest: HttpRequest): HttpResponse {
        const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'];
        for(const field of requiredFields){
            if(!httpRequest.body[field]){
                return badRequest(new MissingParamError(field))
            }
        }
        const emailIsValid = this.emailValidator.isValid(httpRequest.body.email)

        if(!emailIsValid){
            return badRequest(new InvalidParamError('email'))
        }
    }
}

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator
}
const makeSut = (): SutTypes => {
    class EmailValidatorStub implements EmailValidator{
        isValid(email: string): boolean {
            return true;
        }
    }
    const emailValidatorStub = new EmailValidatorStub();
    const sut = new SignUpController(emailValidatorStub)
    return {
        sut,
        emailValidatorStub
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
        const {sut} = makeSut()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('name'))

    })

    test('should return 400 if no email is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const {sut} = makeSut()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))

    })

    test('should return 400 if no password is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const {sut} = makeSut()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))

    })

    test('should return 400 if no passwordConfirmation is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_pass",
                password: "any_pass"
            }
        }
        const {sut} = makeSut()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))

    })

    test('should return 400 if an invalid email is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                email: "invalid_email@mail.com",
                password: "any_pass",
                passwordConfirmation: 'any_pass'
            }
        }
        const {sut, emailValidatorStub} = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))

    })
})