import { AddAccount, Encrypter} from './db-add-account-protocols'
import {DbAddAccount} from './db-add-account'


type SutTypes = {
    sut: AddAccount,
    encrypterStub: Encrypter
}

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(value: string): Promise<string> {
            return new Promise(resolve => resolve("hashed-string"))
        }
    }
    return new EncrypterStub()
}

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter();
    const sut = new DbAddAccount(encrypterStub);
    return {
        sut,
        encrypterStub
    }
}

describe('DbAddAccount Usecase', () => {
    test('should call Encrypter with correct password', async () => {

        const {sut, encrypterStub} = makeSut()

        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

        const accountData = {
            name: "any_email", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        await sut.add(accountData)

        expect(encryptSpy).toHaveBeenCalledWith("any_password")
    })

    test('should throw if encrypter throws', async () => {

        const {sut, encrypterStub} = makeSut()

        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

        const accountData = {
            name: "any_email", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        const accountPromised = sut.add(accountData)

        await expect(accountPromised).rejects.toThrow()
    })
})