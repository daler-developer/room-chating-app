import { Box, Container, Paper, Link as MuiLink, Button, IconButton, Avatar, Menu, MenuItem, Typography } from "@mui/material"
import { HomeOutlined as HomeOutlinedIcon, PeopleOutline as PeopleOutlineIcon } from '@mui/icons-material'
import Image from "next/image"
import NextLink from 'next/link'
import CustomAvatar from "./CustomAvatar"
import { useRef, useState } from "react"
import useCurrentUser from "../hooks/useCurrentUser"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { ModalsEnum, uiActions } from "../redux/slices/uiSlice"

export default () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const currentUser = useCurrentUser()!

  const dispatch = useTypedDispatch()

  const avatarRef = useRef<any>(null!)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')

    window.location.reload()
  }

  return (
    <Paper elevation={3} sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: '300' }}>
      <Container maxWidth="md">
        <Box sx={{ height: '60px', display: 'flex', alignItems: 'center', columnGap: '10px' }}>

          <Avatar src={currentUser.avatar} sx={{ cursor: 'pointer' }} onClick={() => setIsPopupOpen(true)} ref={avatarRef} />

          <Typography variant="h6">
            {currentUser.username}
          </Typography>

          <Menu onClick={() => setIsPopupOpen(false)} autoFocus={false} open={isPopupOpen} onClose={() => setIsPopupOpen(false)} anchorEl={avatarRef.current}>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
            <NextLink href={`/users/${currentUser._id}`} passHref>
              <MenuItem>
                Profile
              </MenuItem>
            </NextLink>
            <MenuItem onClick={() => dispatch(uiActions.changedCurrentActiveModal(ModalsEnum.UPDATE_PROFILE))}>
              Update profile
            </MenuItem>
          </Menu>

          <Box component="nav" sx={{ ml: 'auto', display: 'flex', columnGap: '10px' }}>
            <NextLink href="/rooms" passHref>
              <IconButton>
                <HomeOutlinedIcon />
              </IconButton>
            </NextLink>
            <NextLink href="/users" passHref>
              <IconButton>
                <PeopleOutlineIcon />
              </IconButton>
            </NextLink>
          </Box>

        </Box>
      </Container>
    </Paper>
  )
}
