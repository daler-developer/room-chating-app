import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  DialogActions,
  Button,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useTypedDispatch from '../hooks/useTypedDispatch'
import useTypedSelector from '../hooks/useTypedSelector'
import { uiActions, uiSelectors } from '../redux/slices/uiSlice'
import * as yup from 'yup'
import { roomsActions, roomsSelectors } from '../redux/slices/roomsSlice'
import { useEffect } from 'react'

interface IFormValues {
  password: string
}

const validationSchema = yup.object({
  password: yup.string().min(3).max(20).required(),
})

export default () => {
  const isOpen = useTypedSelector(uiSelectors.selectIsDeleteRoomModalOpen)
  const roomId = useTypedSelector(roomsSelectors.selectIdOfRoomUserIsDeleting)!

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema),
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen])

  const dispatch = useTypedDispatch()

  const closeModal = () => {
    dispatch(uiActions.closedCurrentActiveModal())
  }

  const handleSubmit = async ({ password }: IFormValues) => {
    try {
      await dispatch(roomsActions.roomDeleted({ roomId, password })).unwrap()

      closeModal()
    } catch (e) {}
  }

  return (
    <Dialog maxWidth='xs' fullWidth open={isOpen} onClose={() => closeModal()}>
      <DialogTitle>Delete Room</DialogTitle>

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
          <Button type='submit' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
