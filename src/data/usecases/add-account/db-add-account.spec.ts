import { AccountModel } from "../../../domain/models/account";
import { AddAccount, AddAccountModel } from "../../../domain/usecases/add-account";
import { Encrypter } from "../../protocols/encrypter";


class EncrypterStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
        return new Promise(resolve => resolve("hashed-string"))
    }
}

class DbAddAccount implements AddAccount {
    constructor(private readonly encrypter: Encrypter){

    }
    async add(account: AddAccountModel): Promise<AccountModel> {
        const result = await this.encrypter.encrypt(account.password)
        return new Promise(async resolve => resolve(null))
    }
}

describe('DbAddAccount Usecase', () => {
    test('should call Encrypter with correct password', async () => {
        const encrypterStub = new EncrypterStub();
        const sut = new DbAddAccount(encrypterStub);

        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

        const accountData = {
            name: "any_email", 
            email: "any_email@mail.com", 
            password: "any_password"
        }
        await sut.add(accountData)

        expect(encryptSpy).toHaveBeenCalledWith("any_password")
    })

})