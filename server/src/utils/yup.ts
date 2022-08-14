import * as yup from 'yup'
import { ValidationError } from '../errors'

export const validateData = async (data: any, schema: yup.AnySchema) => {
  try {
    return await schema.validate(data, { abortEarly: false })
  } catch (e) {
    throw new ValidationError(formatErrors(e as yup.ValidationError))
  }
}

export const formatErrors = (e: yup.ValidationError) => {
  const errors: { path: string; messages: string[] }[] = []

  e.inner.forEach((item) => {
    if (errors.some((e) => e.path === item.path)) {
      errors.find((e) => e.path === item.path)!.messages.push(...item.errors)
    } else {
      errors.push({
        path: item.path!,
        messages: item.errors,
      })
    }
  })

  return errors
}
