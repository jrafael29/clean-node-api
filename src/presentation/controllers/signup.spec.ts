import {MissingParamError, ServerError, InvalidParamError} from '../errors'
import {badRequest, serverError} from '../helpers/http-helper'
import {Controller, EmailValidator, HttpRequest, HttpResponse} from '../protocols'

class SignUpController implements Controller{
    private readonly emailValidator: EmailValidator
    constructor(emailValidator: EmailValidator){
        this.emailValidator = emailValidator
    }
    perform (httpRequest: HttpRequest): HttpResponse {
        try{
            const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'];
            for(const field of requiredFields){
                if(!httpRequest.body[field]){
                    return badRequest(new MissingParamError(field))
                }
            }

            if(httpRequest.body.password !== httpRequest.body.passwordConfirmation){
                return badRequest(new InvalidParamError('passwordConfirmation'));
            }

            const emailIsValid = this.emailValidator.isValid(httpRequest.body.email)
    
            if(!emailIsValid){
                return badRequest(new InvalidParamError('email'))
            }
        }catch(error){
            return serverError();
        }
        
    }
}

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
}
const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator()
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

    test('should return 400 if password confirmations fails', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_pass",
                password: "any_pass",
                passwordConfirmation: "invalid_password"
            }
        }
        const {sut} = makeSut()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))

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

    test('should call email validator with correct email', () => {
        const {sut, emailValidatorStub} = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@mail.com",
                password: "any_pass",
                passwordConfirmation: 'any_pass'
            }
        }

        sut.perform(httpRequest)

        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')

    })

    test('should return 500 if email validator throws', () => {

        const {sut, emailValidatorStub} = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error()
        })

        const httpRequest = {
            body: {
                name: "any_name",
                email: "invalid_email@mail.com",
                password: "any_pass",
                passwordConfirmation: 'any_pass'
            }
        }
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())

    })
})