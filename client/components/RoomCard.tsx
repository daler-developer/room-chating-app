import { Avatar, AvatarGroup, Box, Button, Paper, Typography } from "@mui/material"
import { LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon } from '@mui/icons-material'
import { IRoom } from "../models"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { ModalsEnum, uiActions } from "../redux/slices/uiSlice"
import { roomsActions } from "../redux/slices/roomsSlice"
import NextLink from 'next/link'

interface IProps {
  room: IRoom
}

export default ({ room }: IProps) => {
  const dispatch = useTypedDispatch()

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
    <Paper elevation={3} sx={{ padding: '10px', position: 'relative' }}>

      <Box sx={{ position: 'absolute', top: '15px', right: '15px' }}>
        {room.isPrivate ? <LockIcon color="error" /> : <LockOpenIcon color="success" />}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
        <Avatar src={room.creator.avatar} />
        <Typography>
          {room.creator.username}
        </Typography>
      </Box>

      <Box sx={{ mt: '20px', textAlign: 'center' }}>
        <Typography variant="h5">
          {room.name}
        </Typography>
      </Box>

      <Box sx={{ mt: '30px', display: 'flex', alignItems: 'center', columnGap: '15px' }}>
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
            room.isCreatedByCurrentUser && (
              <Button onClick={handleDeleteBtnClick} color="error" variant="contained">
                Delete
              </Button>
            )
          }
          {
            room.isCurrentUserJoined ? <>
              <NextLink passHref href={`/rooms/${room._id}`}>
                <Button key="enterBtn" sx={{ }} variant="contained">
                  Enter
                </Button>
              </NextLink>
              <Button key="leaveBtn" sx={{ }} variant="outlined" color="error" onClick={handleLeaveRoomBtnClick}>
                Leave
              </Button>
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
