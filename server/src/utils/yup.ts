import * as yup from 'yup'

export const formatErrors = (e: yup.ValidationError) => {
  const errors: { path: string, messages: string[] }[] = []

  e.inner.forEach((item) => {
    if (errors.some((e) => e.path === item.path)) {
      errors.find((e) => e.path === item.path)!.messages.push(...item.errors)
    } else {
      errors.push({
        path: item.path!,
        messages: item.errors
      })
    }
  })

  return errors
}
