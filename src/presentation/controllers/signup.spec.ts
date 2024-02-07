
class SignUpController{
    perform (httpRequest: any): any {
        return {
            statusCode: 400
        }
    }
}

describe('SignUp Controller', () => {
    test('should return 400 if no name is provided', () => {
        const httpRequest = {
            body: {
                name: "",
                email: "any_email@mail.com",
                password: "any_pass",
                passwordConfirmation: "any_pass"
            }
        }
        const sut = new SignUpController()
        const httpResponse = sut.perform(httpRequest)

        expect(httpResponse.statusCode).toBe(400)
    })
})