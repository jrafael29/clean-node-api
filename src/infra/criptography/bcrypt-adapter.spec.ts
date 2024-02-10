import bcrypt from 'bcrypt'
import {Encrypter} from '../../data/protocols/encrypter'
class BcryptAdapter implements Encrypter{

    constructor(private readonly salt: number){}

    async encrypt(value: string): Promise<string> {
        await bcrypt.hash(value, 12);
        return ''
    }
}

describe('Bcrypt Adapter', () => {
    test('should call bcrypt with correct values', async () => {
        const bcryptHashSpy = jest.spyOn(bcrypt, 'hash')
        const salt = 12
        const sut = new BcryptAdapter(salt);
        await sut.encrypt('any_value');

        expect(bcryptHashSpy).toHaveBeenCalledWith('any_value', salt)
    })
})