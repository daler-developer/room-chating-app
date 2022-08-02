import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material'
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useTypedDispatch from '../hooks/useTypedDispatch'
import useTypedSelector from '../hooks/useTypedSelector'
import { uiActions, uiSelectors } from '../redux/slices/uiSlice'
import useCurrentUser from '../hooks/useCurrentUser'
import {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usersActions } from '../redux/slices/usersSlice'
import { authActions } from '../redux/slices/authSlice'
import { AxiosError } from 'axios'
import { IErrorResponse } from '../types'

interface IFormValues {
  username: string
  firstName: string
  lastName: string
}

const validationSchema = yup.object({})

export default () => {
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined)
  const [removeAvatarSelected, setRemoveAvatarSelected] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const isOpen = useTypedSelector(uiSelectors.selectIsUpdateProfileModalOpen)

  const dispatch = useTypedDispatch()

  const avatarFileInputRef = useRef<HTMLInputElement>(null!)
  const editAvatarBtnRef = useRef<any>(null!)

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema),
  })

  const currentUser = useCurrentUser()!

  const avatarUrl = removeAvatarSelected
    ? null
    : avatarFile
    ? URL.createObjectURL(avatarFile)
    : currentUser.avatar

  useEffect(() => {}, [])

  useEffect(() => {
    if (isOpen) {
      form.setValue('username', currentUser.username)
      form.setValue('firstName', currentUser.firstName)
      form.setValue('lastName', currentUser.lastName)
    } else {
      form.reset()
      setAvatarFile(undefined)
      setRemoveAvatarSelected(false)
      setIsPopupOpen(false)
    }
  }, [isOpen])

  const handleAxiosError = (data: IErrorResponse) => {
    console.log(data)
    switch (data.errorCode) {
      case 'validation_error':
        data.errors.forEach((error) => {
          form.setError(error.path, { message: error.messages[0] })
        })
        break
    }
  }

  const handleSubmit = async ({
    username,
    firstName,
    lastName,
  }: IFormValues) => {
    try {
      await dispatch(
        authActions.profileUpdated({
          ...(removeAvatarSelected
            ? { removeAvatar: true }
            : { removeAvatar: false }),
          ...(avatarFile && { avatar: avatarFile }),
          ...(currentUser.username !== username && { username }),
          ...(currentUser.firstName !== firstName && { firstName }),
          ...(currentUser.lastName !== lastName && { lastName }),
        })
      ).unwrap()
    } catch (e) {
      handleAxiosError(e as IErrorResponse)
    }
  }

  const closeModal = () => {
    dispatch(uiActions.closedCurrentActiveModal())
  }

  const handleAvatarFileInputChange = (e: FormEvent<HTMLInputElement>) => {
    setAvatarFile(e.currentTarget.files![0])
    setRemoveAvatarSelected(false)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(undefined)
    setRemoveAvatarSelected(true)
  }

  const handleRemoveUploadedAvatarBtnClick = () => {
    setAvatarFile(undefined)
    avatarFileInputRef.current.value = null
  }

  return (
    <Dialog maxWidth='xs' fullWidth open={isOpen} onClose={() => closeModal()}>
      <DialogTitle>Update profile</DialogTitle>
      <Box component='form' onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', rowGap: '8px' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={avatarUrl} sx={{ width: '60px', height: '60px' }} />

            <Box sx={{ ml: 'auto', display: 'flex', columnGap: '0' }}>
              {avatarFile && (
                <IconButton
                  onClick={handleRemoveUploadedAvatarBtnClick}
                  color='error'
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <IconButton
                onClick={() => setIsPopupOpen(true)}
                ref={editAvatarBtnRef}
              >
                <EditIcon />
              </IconButton>
            </Box>

            <Menu
              onClick={() => setIsPopupOpen(false)}
              onClose={() => setIsPopupOpen(false)}
              open={isPopupOpen}
              autoFocus={false}
              anchorEl={editAvatarBtnRef.current}
            >
              <MenuItem onClick={() => avatarFileInputRef.current!.click()}>
                Upload new avatar
              </MenuItem>
              <MenuItem onClick={handleRemoveAvatar}>Remove avatar</MenuItem>
            </Menu>
            <input
              onChange={handleAvatarFileInputChange}
              ref={avatarFileInputRef}
              type='file'
              hidden
            />
          </Box>
          <TextField
            placeholder='Username'
            helperText={form.formState.errors.username?.message}
            error={!!form.formState.errors.username}
            {...form.register('username')}
          />
          <TextField
            placeholder='First name'
            helperText={form.formState.errors.firstName?.message}
            error={!!form.formState.errors.firstName}
            {...form.register('firstName')}
          />
          <TextField
            placeholder='Last name'
            helperText={form.formState.errors.lastName?.message}
            error={!!form.formState.errors.lastName}
            {...form.register('lastName')}
          />
        </DialogContent>

        <DialogActions>
          <Button type='submit' variant='contained'>
            Update
          </Button>
          <Button color='error' type='button' onClick={() => closeModal()}>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
