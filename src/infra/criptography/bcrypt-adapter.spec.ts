import bcrypt from 'bcrypt'
import {Encrypter} from '../../data/protocols/encrypter'


class BcryptAdapter implements Encrypter{

    constructor(private readonly salt: number){}

    async encrypt(value: string): Promise<string> {
        const hash = await bcrypt.hash(value, 12);
        return hash
    }
}

// jest.mock('bcrypt', () => {
//     return {
//         async hash(): Promise<string> {
//             return new Promise(resolve => resolve("hash"))
//         }
//     }
// })

type SutTypes = {
    sut: BcryptAdapter
}

const salt = 12;
const makeSut = (): SutTypes => {
    const sut = new BcryptAdapter(salt);
    return {
        sut
    }
}

describe('Bcrypt Adapter', () => {
    test('should call bcrypt with correct values', async () => {
        const bcryptHashSpy = jest.spyOn(bcrypt, 'hash')

        const {sut} = makeSut()
        await sut.encrypt('any_value');

        expect(bcryptHashSpy).toHaveBeenCalledWith('any_value', salt)
    })

    test('should returns a hash on success', async () => {
        const {sut} = makeSut()
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
            return new Promise(resolve => resolve('hash'))
        })
        const hash = await sut.encrypt('any_value');

        expect(hash).toBe('hash')
    })

    test('should throw if bcrypt throws', async () => {
        const {sut} = makeSut()

        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
            throw new Error()
        })

        const promise = sut.encrypt('any_value');

        await expect(promise).rejects.toThrow()
    })
})