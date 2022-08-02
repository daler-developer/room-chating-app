import axios, { AxiosError } from 'axios'
import usersService from './usersService'

const client = axios.create()

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers!['authorization'] = `Bearer ${token}`
  }

  return config
})

// client.interceptors.response.use((e) => e, async (error: AxiosError) => {
// const originalRequest = error.config

// if (error.response!.status === 401 && !originalRequest._isRetry) {
//   originalRequest._isRetry = true

//   const { data } = await usersService.refreshToken()

//   localStorage.setItem('accessToken', data.accessToken)

//   return client(originalRequest)
// }
// })

export default client
