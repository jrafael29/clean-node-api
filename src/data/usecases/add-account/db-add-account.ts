import {AccountModel, AddAccount, AddAccountModel, Encrypter, AddAccountRepository} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
    constructor(
        private readonly encrypter: Encrypter, 
        private readonly repository: AddAccountRepository
    ){}


    async add(accountData: AddAccountModel): Promise<AccountModel> {
        const hashedPassword = await this.encrypter.encrypt(accountData.password)
        const repositoryResult = await this.repository.add({
            ...accountData,
            password: hashedPassword
        });
        return new Promise(async resolve => resolve(null))
    }
}