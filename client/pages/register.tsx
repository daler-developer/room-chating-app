import { Box, Button, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect } from "react"
import NextLink from 'next/link'
import * as yup from 'yup'
import useIsAuthenticated from "../hooks/useIsAuthenticated"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { authActions } from "../redux/slices/authSlice"
import { socket, initSocket } from "../socket"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { IErrorResponse } from "../types"

interface IFormValues {
  username: string
  password: string
  firstName: string
  lastName: string
}

const validationSchema = yup.object({
  username: yup.string().required().min(3).max(20),
  password: yup.string().required().min(3).max(20),
  firstName: yup.string().required().min(3).max(20),
  lastName: yup.string().required().min(3).max(20)
})

export default () => {
  const router = useRouter()
  
  const dispatch = useTypedDispatch()

  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/users')
    }
  }, [isAuthenticated])

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema)
  })

  const handleError = (data: IErrorResponse) => {
    switch (data.errorCode) {
      case 'validation_error':
        data.errors.forEach(error => {
          form.setError(error.path as keyof IFormValues, { message: error.messages[0] })
        })
        break
      case 'user_already_exists':
        form.setError('username', { message: data.message })
        break
    }
  }

  const handleSubmit = async ({ username, password, firstName, lastName }: IFormValues) => {
    try {
      await dispatch(authActions.register({ username, firstName, lastName, password })).unwrap()
    } catch (e) {
      handleError(e as IErrorResponse)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Box component="form" onSubmit={form.handleSubmit(handleSubmit)} sx={{ display: 'flex', maxWidth: '500px', width: '100%', flexDirection: 'column' }}>

        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          Register
        </Typography>

        <TextField
          label="Username"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.username}
          helperText={form.formState.errors.username?.message}
          {...form.register('username')}
        />

        <TextField
          label="First name"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.firstName}
          helperText={form.formState.errors.firstName?.message}
          {...form.register('firstName')}
        />

        <TextField
          label="Last name"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.lastName}
          helperText={form.formState.errors.lastName?.message}
          {...form.register('lastName')}
        />

        <TextField
          label="Password"
          sx={{ mt: '20px' }}
          error={!!form.formState.errors.password}
          helperText={form.formState.errors.password?.message}
          {...form.register('password')}
        />

        <Button type="submit" variant="contained" sx={{ mt: '40px' }}>
          Register
        </Button>

        <NextLink href="/login" passHref>
          <Button sx={{ mt: '10px' }}>
            Login
          </Button>
        </NextLink>

      </Box>
    </Box>
  )
}
