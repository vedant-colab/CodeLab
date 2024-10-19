import { SanitizeOptions } from "../interfaces/interface"

export const signUpModel : SanitizeOptions = {
    allowedFields : [
    'username',
    'password',
    'email'
    ]
}

export const tokenAuthenticationModel : SanitizeOptions={
    allowedFields : [
        'username',
        'password'
    ]
}