import { Box, Button, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useLayoutEffect } from "react"
import NextLink from 'next/link'
import * as yup from 'yup'
import useIsAuthenticated from "../hooks/useIsAuthenticated"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { authActions } from "../redux/slices/authSlice"
import { socket, initSocket } from "../socket"
import useQueryParam from "../hooks/useQueryParam"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { AxiosError } from "axios"
import { IErrorResponse } from "../types"

interface IFormValues {
  username: string
  password: string
}

const validationSchema = yup.object({
  username: yup.string().required().min(3).max(20),
  password: yup.string().required().min(3).max(20)
})

export default () => {
  const [nextQueryParam] = useQueryParam('next')

  const router = useRouter()
  
  const dispatch = useTypedDispatch()

  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      router.push(nextQueryParam as string || '/users')
    }
  }, [isAuthenticated])

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema)
  })

  const handleAxiosError = (e: AxiosError<IErrorResponse>) => {
    const data = e.response!.data

    switch (data.errorCode) {
      case 'validation_error':
        data.errors.forEach(error => {
          form.setError(error.path as 'username' | 'password', { message: error.messages[0] })
        })
        break
    }
  }

  const handleSubmit = async ({ username, password }: IFormValues) => {
    try {
      await dispatch(authActions.login({ username, password })).unwrap()
          
      initSocket()
      socket.emit('login')
    } catch (e) {
      if (e instanceof AxiosError) {
        handleAxiosError(e)
      }
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box component="form" onSubmit={form.handleSubmit(handleSubmit)} sx={{ display: 'flex', maxWidth: '500px', width: '100%', flexDirection: 'column' }}>

        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          Login
        </Typography>

        <TextField
          label="Username"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.username}
          helperText={form.formState.errors.username?.message}
          {...form.register('username')}
        />

        <TextField
          label="Password"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.password}
          helperText={form.formState.errors.password?.message}
          {...form.register('password')}
        />

        <Button type="submit" variant="contained" sx={{ mt: '40px' }}>
          Login
        </Button>

        <NextLink href="/register" passHref>
          <Button sx={{ mt: '10px' }}>
            Register
          </Button>
        </NextLink>

      </Box>
    </Box>
  )
}
