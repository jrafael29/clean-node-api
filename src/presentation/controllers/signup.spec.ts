import {httpRequest,httpResponse} from '../protocols/http'
class SignUpController{
    perform (httpRequest: httpRequest): httpResponse {

        if(!httpRequest.body.name){
            return {
                statusCode: 400,
                body: new Error('Missing param: name')
            }
        }
        if(!httpRequest.body.email){
            return {
                statusCode: 400,
                body: new Error('Missing param: email')
            }
        }
    }
}

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const httpRequest = {
            body: {
                email: "any_email@mail.com",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const sut = new SignUpController()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new Error('Missing param: name'))

    })

    test('should return 400 if no name is provided', () => {
        const httpRequest = {
            body: {
                name: "any_name",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const sut = new SignUpController()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new Error('Missing param: email'))

    })
})