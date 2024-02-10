import bcrypt from 'bcrypt'
import {Encrypter} from '../../data/protocols/encrypter'
class BcryptAdapter implements Encrypter{

    constructor(private readonly salt: number){}

    async encrypt(value: string): Promise<string> {
        const hash = await bcrypt.hash(value, 12);
        return hash
    }
}

jest.mock('bcrypt', () => {
    return {
        async hash(): Promise<string> {
            return new Promise(resolve => resolve("hash"))
        }
    }
})

describe('Bcrypt Adapter', () => {
    test('should call bcrypt with correct values', async () => {
        const bcryptHashSpy = jest.spyOn(bcrypt, 'hash')
        const salt = 12
        const sut = new BcryptAdapter(salt);
        await sut.encrypt('any_value');

        expect(bcryptHashSpy).toHaveBeenCalledWith('any_value', salt)
    })

    test('should returns a hash on success', async () => {
        const salt = 12
        const sut = new BcryptAdapter(salt);
        const hash = await sut.encrypt('any_value');

        expect(hash).toBe('hash')
    })
})