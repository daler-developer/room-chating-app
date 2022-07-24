import { Box, Container, Paper, Link as MuiLink, Button, IconButton, Avatar, Menu, MenuItem, Typography } from "@mui/material"
import { HomeOutlined as HomeOutlinedIcon, PeopleOutline as PeopleOutlineIcon } from '@mui/icons-material'
import Image from "next/image"
import NextLink from 'next/link'
import CustomAvatar from "./CustomAvatar"
import { useRef, useState } from "react"
import useCurrentUser from "../hooks/useCurrentUser"

export default () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const currentUser = useCurrentUser()!

  const avatarRef = useRef<any>(null!)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')

    window.location.reload()
  }

  return (
    <Paper elevation={3} sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: '300' }}>
      <Container maxWidth="md">
        <Box sx={{ height: '60px', display: 'flex', alignItems: 'center', columnGap: '10px' }}>

          <Avatar src={currentUser.avatar} sx={{ cursor: 'pointer' }} onClick={() => setIsPopupOpen(true)} ref={avatarRef} />

          <Typography variant="h6">
            {currentUser.username}
          </Typography>

          <Menu autoFocus={false} open={isPopupOpen} onClose={() => setIsPopupOpen(false)} anchorEl={avatarRef.current}>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
            <MenuItem>
              Profile
            </MenuItem>
          </Menu>

          <Box component="nav" sx={{ ml: 'auto', display: 'flex', columnGap: '10px' }}>
            <NextLink href="/" passHref>
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
