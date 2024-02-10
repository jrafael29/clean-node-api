import { EmailValidator } from "../presentation/protocols/email-validator";

class EmailValidatorAdapter implements EmailValidator{
    isValid(email: string): boolean {
        return false;
    }
}

describe('EmailValidator Adapter', () => {
    test('should returns false if validator returns false', () => {
        const sut = new EmailValidatorAdapter();
        const isValidEmail: boolean = sut.isValid('invalid_email@mail.com');
        expect(isValidEmail).toBe(false)
    })
})