
type ErrorCodesType =
  'validation_error'

export interface IErrorResponse {
  errorCode: ErrorCodesType
  message: string
  errors: {
    path: string
    messages: string[]
  }[]
}
