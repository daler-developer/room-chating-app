import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { uiActions, uiSelectors } from '../redux/slices/uiSlice'
import useTypedSelector from '../hooks/useTypedSelector'
import useTypedDispatch from '../hooks/useTypedDispatch'
import { roomsActions, roomsSelectors } from '../redux/slices/roomsSlice'
import { useEffect, useRef } from 'react'

interface IFormValues {
  password: string
}

const validationSchema = yup.object({
  password: yup.string().min(3).max(20).required(),
})

export default () => {
  const isOpen = useTypedSelector(uiSelectors.selectIsJoinRoomOpen)
  const roomId = useTypedSelector(roomsSelectors.selectIdOfRoomUserIsJoining)!

  const dispatch = useTypedDispatch()

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen])

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema),
  })

  const closeModal = () => {
    dispatch(uiActions.closedCurrentActiveModal())
  }

  const handleSubmit: SubmitHandler<IFormValues> = async ({ password }) => {
    try {
      await dispatch(roomsActions.joinedRoom({ roomId, password })).unwrap()

      closeModal()
    } catch (e) {
      alert('error')
    }
  }

  return (
    <Dialog maxWidth='xs' fullWidth open={isOpen} onClose={() => closeModal()}>
      <DialogTitle>Join Room</DialogTitle>

      <Box component='form' onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogContent>
          <TextField
            fullWidth
            label='Password'
            error={!!form.formState.errors.password}
            helperText={
              form.formState.errors.password &&
              form.formState.errors.password.message
            }
            {...form.register('password')}
          />
        </DialogContent>

        <DialogActions>
          <Button type='submit' onClick={() => {}}>
            Join
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
