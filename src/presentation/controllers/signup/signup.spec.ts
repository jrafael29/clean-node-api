import {AccountModel, AddAccount, AddAccountModel, Controller, EmailValidator, HttpRequest, HttpResponse} from './signup-protocols'
import {MissingParamError, ServerError, InvalidParamError} from '../../errors'
import {badRequest, serverError} from '../../helpers/http-helper'

class SignUpController implements Controller{
    private readonly emailValidator: EmailValidator
    private readonly addAccount: AddAccount

    constructor(emailValidator: EmailValidator, addAccount: AddAccount){
        this.emailValidator = emailValidator
        this.addAccount = addAccount
    }
    perform (httpRequest: HttpRequest): HttpResponse {
        try{
            const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'];
            for(const field of requiredFields){
                if(!httpRequest.body[field]){
                    return badRequest(new MissingParamError(field))
                }
            }
            const {name, email, password, passwordConfirmation} = httpRequest.body;
            if(password !== passwordConfirmation){
                return badRequest(new InvalidParamError('passwordConfirmation'));
            }
            const emailIsValid = this.emailValidator.isValid(email)
            if(!emailIsValid){
                return badRequest(new InvalidParamError('email'))
            }
            this.addAccount.add({
                name,
                email,
                password
            })
        }catch(error){
            return serverError();
        }
        
    }
}

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
    addAccountStub: AddAccount
}


const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
}
const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        add(account: AddAccountModel): AccountModel {
            const fakeAccount = {
                id: "valid_id",
                name: "valid_name",
                email: "valid_email@mail.com",
                password: "valid_password"
            }
            return fakeAccount;
        }
    }
    return new AddAccountStub();
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator()
    const addAccountStub = makeAddAccount()
    const sut = new SignUpController(emailValidatorStub, addAccountStub)
    return {
        sut,
        emailValidatorStub,
        addAccountStub
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

    test('should return 500 if EmailValidator throws', () => {

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

    test('should call AddAccount with correct values', () => {
        const { sut, addAccountStub } = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')

        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@mail.com",
                password: "any_pass",
                passwordConfirmation: 'any_pass'
            }
        }

        sut.perform(httpRequest)

        expect(addSpy).toHaveBeenCalledWith({
            name: "any_name",
            email: "any_email@mail.com",
            password: "any_pass",
        })

    })

    test('should return 500 if AddAccount throws', () => {

        const {sut, addAccountStub} = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
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