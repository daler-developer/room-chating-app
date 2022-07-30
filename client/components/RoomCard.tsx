import { Avatar, AvatarGroup, Box, Button, IconButton, Menu, MenuItem, Paper, Typography } from "@mui/material"
import { LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, MoreVert as MoreVertIcon } from '@mui/icons-material'
import { IRoom } from "../types"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { ModalsEnum, uiActions } from "../redux/slices/uiSlice"
import { roomsActions } from "../redux/slices/roomsSlice"
import NextLink from 'next/link'
import { useRef, useState } from "react"

interface IProps {
  room: IRoom
}

export default ({ room }: IProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const dispatch = useTypedDispatch()

  const menuBtnRef = useRef(null!)

  const handleJoinRoomBtnClick = () => {
    if (room.isPrivate) {
      dispatch(roomsActions.changedIdOfRoomUserIsJoining(room._id))
      dispatch(uiActions.changedCurrentActiveModal(ModalsEnum.JOIN_ROOM))
    } else {
      dispatch(roomsActions.joinedRoom({ roomId: room._id }))
    }
  }

  const handleLeaveRoomBtnClick = () => {
    dispatch(roomsActions.leftRoom(room._id))
  }

  const handleDeleteBtnClick = () => {
    dispatch(roomsActions.changedIdOfRoomUserIsDeleting(room._id))
    dispatch(uiActions.changedCurrentActiveModal(ModalsEnum.DELETE_ROOM))
  }

  return (
    <Paper elevation={10} sx={{ padding: '10px', position: 'relative' }}>

      <Box sx={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
        <Typography variant="h5">
          {room.name}
        </Typography>

        <Box sx={{ ml: 'auto', display: 'flex', columnGap: '5px', alignItems: 'center' }}>
          {room.isPrivate ? <LockIcon color="error" /> : <LockOpenIcon color="success" />}
          <IconButton onClick={() => setIsPopupOpen(true)} ref={menuBtnRef}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={menuBtnRef.current}
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {
          room.isCreatedByCurrentUser && (
            <MenuItem onClick={handleDeleteBtnClick}>
              Delete
            </MenuItem>
          )
        }
        {
          room.isCurrentUserJoined && (
            <MenuItem onClick={handleLeaveRoomBtnClick}>
              Leave
            </MenuItem>
          )
        }
      </Menu>

      <Box sx={{ mt: '100px', display: 'flex', alignItems: 'center', columnGap: '15px' }}>
        <AvatarGroup sx={{ alignSelf: 'end' }}>
          {
            room.participants.map((participant, i) => (
              <Avatar key={i} src={participant.avatar} sx={{ width: '20px', height: '20px' }} />
            ))
          }
          {
            room.totalNumParticipants > 2 && (
              <Avatar sx={{ width: '20px', height: '20px' }}>
                <Typography fontSize="10px">
                  +{room.totalNumParticipants - 2}
                </Typography>
              </Avatar>
            )
          }
        </AvatarGroup>
        <Box sx={{ display: 'flex', columnGap: '15px', ml: 'auto' }}>
          {
            room.isCurrentUserJoined ? <>
              <NextLink passHref href={`/rooms/${room._id}`}>
                <Button key="enterBtn" sx={{ }} variant="contained">
                  Enter
                </Button>
              </NextLink>
            </> : <>
              <Button key="joinBtn" sx={{ }} variant="contained" color="success" onClick={handleJoinRoomBtnClick}>
                Join
              </Button>
            </>
          }
        </Box>
      </Box>

    </Paper>
  )
}
