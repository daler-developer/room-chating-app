import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Paper,
} from '@mui/material'
import { useEffect, useState } from 'react'
import useTypedDispatch from '../hooks/useTypedDispatch'
import { IUser } from '../types'
import NextLink from 'next/link'
import { usersActions } from '../redux/slices/usersSlice'
import { socket } from '../socket'
import CustomAvatar from './CustomAvatar'

interface IProps {
  user: IUser
}

export default ({ user }: IProps) => {
  const dispatch = useTypedDispatch()

  useEffect(() => {
    socket.on(`user.${user._id}.login`, () => {
      dispatch(usersActions.userLoggedIn({ userId: user._id }))
    })
    socket.on(`user.${user._id}.logout`, () => {
      dispatch(usersActions.userLoggedOut({ userId: user._id }))
    })
  }, [])

  return (
    <NextLink passHref href={`/users/${user._id}`}>
      <Paper
        elevation={1}
        sx={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          rowGap: '20px',
        }}
      >
        <CustomAvatar withBadge={user.isOnline} />

        <Typography>{user.username}</Typography>
      </Paper>
    </NextLink>
  )
}
