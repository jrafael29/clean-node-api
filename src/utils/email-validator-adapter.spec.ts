import validator from 'validator'
import { EmailValidatorAdapter } from "./EmailValidatorAdapter";

const makeSut = (): EmailValidatorAdapter => {
    return new EmailValidatorAdapter();
}

describe('EmailValidator Adapter', () => {
    test('should returns false if validator returns false', () => {
        const sut = makeSut();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
        const isValidEmail = sut.isValid('invalid_email@mail.com');
        expect(isValidEmail).toBe(false)
    })

    test('should returns true if validator returns true', () => {
        const sut = makeSut();

        const isValidEmail = sut.isValid('valid_email@mail.com');
        expect(isValidEmail).toBe(true)
    })

    test('should call validator with correct email', () => {
        const sut = makeSut();

        const isEmailSpy = jest.spyOn(validator, 'isEmail')
        sut.isValid('any_email@mail.com');
        expect(isEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
    })
})