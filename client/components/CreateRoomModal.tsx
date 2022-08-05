import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import useTypedSelector from '../hooks/useTypedSelector'
import { uiActions, uiSelectors } from '../redux/slices/uiSlice'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useTypedDispatch from '../hooks/useTypedDispatch'
import { useEffect, useState } from 'react'
import { roomsActions } from '../redux/slices/roomsSlice'

interface IFormValues {
  name: string
  password: string
}

const schema = yup.object({})

export default () => {
  const [withPassword, setWithPassword] = useState(false)

  const isOpen = useTypedSelector(uiSelectors.selectIsCreateRoomModalOpen)

  const dispatch = useTypedDispatch()

  useEffect(() => {
    if (!isOpen) {
      // reset modal
      form.reset()
      setWithPassword(false)
    }
  }, [isOpen])

  const form = useForm<IFormValues>({
    resolver: yupResolver(schema),
  })

  const closeModal = () => dispatch(uiActions.closedCurrentActiveModal())

  const handleSubmit = async ({ name, password }: IFormValues) => {
    await dispatch(roomsActions.createdRoom({ name, password }))

    closeModal()
  }

  return (
    <Dialog open={isOpen} onClose={() => closeModal()} maxWidth='xs' fullWidth>
      <DialogTitle>Create Room</DialogTitle>

      <Box component='form' onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}
        >
          <TextField
            fullWidth
            label='Name'
            error={!!form.formState.errors.name}
            helperText={
              form.formState.errors.name && form.formState.errors.name.message
            }
            {...form.register('name')}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', columnGap: '0px' }}>
            <Switch
              checked={withPassword}
              onChange={(e) => setWithPassword(e.target.checked)}
            />
            <Typography>Private</Typography>
          </Box>
          {withPassword && (
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
          )}
        </DialogContent>

        <DialogActions>
          <Button type='submit'>Create</Button>
          <Button onClick={() => closeModal()} type='button' color='error'>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
