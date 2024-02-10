import {AccountModel, AddAccount, AddAccountModel, Encrypter} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
    constructor(private readonly encrypter: Encrypter){}
    async add(account: AddAccountModel): Promise<AccountModel> {
        const result = await this.encrypter.encrypt(account.password)
        return new Promise(async resolve => resolve(null))
    }
}