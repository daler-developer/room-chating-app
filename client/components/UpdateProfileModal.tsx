import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, TextField } from "@mui/material"
import { Edit as EditIcon } from '@mui/icons-material'
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import useTypedDispatch from "../hooks/useTypedDispatch"
import useTypedSelector from "../hooks/useTypedSelector"
import { uiActions, uiSelectors } from "../redux/slices/uiSlice"
import useCurrentUser from "../hooks/useCurrentUser"
import { ChangeEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from "react"
import { usersActions } from "../redux/slices/usersSlice"

interface IFormValues {
  username: string
  firstName: string
  lastName: string
}

const validationSchema = yup.object({

})

export default () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [removeAvatarSelected, setRemoveAvatarSelected] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const isOpen = useTypedSelector(uiSelectors.selectIsUpdateProfileModalOpen)

  const dispatch = useTypedDispatch()

  const avatarFileInputRef = useRef<HTMLInputElement>(null!)
  const editAvatarBtnRef = useRef<any>(null!)

  const form = useForm<IFormValues>({
    resolver: yupResolver(validationSchema)
  })

  const currentUser = useCurrentUser()!

  const avatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : currentUser.avatar

  useEffect(() => {

  }, [])

  useEffect(() => {
    if (isOpen) {
      form.setValue('username', currentUser.username)
      form.setValue('firstName', currentUser.firstName)
      form.setValue('lastName', currentUser.lastName)
    }
  }, [isOpen])

  const handleSubmit = async ({ username, firstName, lastName }: IFormValues) => {
    dispatch(usersActions.profileUpdated({
      avatar: avatarFile,
      removeAvatar: removeAvatarSelected,
      firstName,
      lastName,
      username
    }))
  }

  const handleAvatarFileInputChange = (e: ChangeEvent) => {
    setAvatarFile((e.currentTarget.files as FileList)[0])
    setRemoveAvatarSelected(false)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setRemoveAvatarSelected(true)
  }

  return (
    <Dialog maxWidth="xs" fullWidth open={isOpen} onClose={() => dispatch(uiActions.closedCurrentActiveModal())}>
      <DialogTitle>Update profile</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', rowGap: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={avatarUrl} sx={{ width: '60px', height: '60px' }} />

            <IconButton onClick={() => setIsPopupOpen(true)} ref={editAvatarBtnRef} sx={{ ml: 'auto' }}>
              <EditIcon />
            </IconButton >

            <Menu onClick={() => setIsPopupOpen(false)} onClose={() => setIsPopupOpen(false)} open={isPopupOpen} autoFocus={false} anchorEl={editAvatarBtnRef.current}>
              <MenuItem onClick={() => avatarFileInputRef.current!.click()}>
                Upload new avatar
              </MenuItem>
              <MenuItem onClick={handleRemoveAvatar}>
                Remove avatar
              </MenuItem>
            </Menu>
            <input onChange={handleAvatarFileInputChange} ref={avatarFileInputRef} type="file" hidden />
          </Box>
          <TextField
            placeholder="Username"
            {...form.register('username')}
          />
          <TextField
            placeholder="First name"
            {...form.register('firstName')}
          />
          <TextField
            placeholder="Last name"
            {...form.register('lastName')}
          />
        </DialogContent>

        <DialogActions>
          <Button type="submit">
            Update
          </Button>
          <Button type="button">
            Cancel
          </Button>
        </DialogActions>

      </Box>
    </Dialog>
  )
}
