import { AccountModel, AddAccount, AddAccountModel, AddAccountRepository, Encrypter} from './db-add-account-protocols'
import {DbAddAccount} from './db-add-account'


const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        
        add(accountData: AddAccountModel): Promise<AccountModel> {
            const mockAccount = {
                id: "valid_id",
                ...accountData,
                password: "hashed-string"
            }
            return new Promise(resolve => resolve(mockAccount))
        }
    }
    return new AddAccountRepositoryStub()
}

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(value: string): Promise<string> {
            return new Promise(resolve => resolve("hashed-string"))
        }
    }
    return new EncrypterStub()
}

type SutTypes = {
    sut: AddAccount,
    encrypterStub: Encrypter,
    addAccountRepositoryStub: AddAccountRepository
}
const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository()
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub
    }
}

describe('DbAddAccount Usecase', () => {
    test('should call Encrypter with correct password', async () => {

        const {sut, encrypterStub} = makeSut()

        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

        const accountData = {
            name: "any_name", 
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
            name: "any_name", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        const accountPromised = sut.add(accountData)

        await expect(accountPromised).rejects.toThrow()
    })

    test('should call AddAccountRepository with correct values', async () => {

        const {sut, addAccountRepositoryStub} = makeSut()

        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');

        const accountData = {
            name: "any_name", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        await sut.add(accountData)

        expect(addSpy).toHaveBeenCalledWith({
            name: "any_name", 
            email: "any_email@mail.com", 
            password: "hashed-string"
        })
    })

    test('should throw if AddAccountRepository throws', async () => {

        const {sut, addAccountRepositoryStub} = makeSut()

        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

        const accountData = {
            name: "any_name", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        const accountPromised = sut.add(accountData)

        await expect(accountPromised).rejects.toThrow()
    })

    test('should return an account on success', async () => {

        const { sut } = makeSut()

        const accountData = {
            name: "valid_name", 
            email: "valid_email@mail.com", 
            password: "valid_password"
        }
        const accountResult = await sut.add(accountData)

        expect(accountResult).toEqual({
            id: "valid_id",
            name: "valid_name", 
            email: "valid_email@mail.com", 
            password: "hashed-string"
        })
    })
})