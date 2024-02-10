import { EmailValidator } from "../presentation/protocols/email-validator";
import validator from 'validator'

class EmailValidatorAdapter implements EmailValidator{
    isValid(email: string): boolean {
        return validator.isEmail(email);
    }
}

describe('EmailValidator Adapter', () => {
    test('should returns false if validator returns false', () => {
        const sut = new EmailValidatorAdapter();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
        const isValidEmail = sut.isValid('invalid_email@mail.com');
        expect(isValidEmail).toBe(false)
    })

    test('should returns true if validator returns true', () => {
        const sut = new EmailValidatorAdapter();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(true)
        const isValidEmail = sut.isValid('valid_email@mail.com');
        expect(isValidEmail).toBe(true)
    })
})