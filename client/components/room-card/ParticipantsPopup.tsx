import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Popover,
  Popper,
  Typography,
} from '@mui/material'
import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import { usersActions } from '../../redux/slices/usersSlice'
import { ErrorResponseType, IRoom, IUser } from '../../types'

interface IProps extends ComponentPropsWithRef<typeof Popper> {
  room: IRoom
  onClose: () => void
}

export default ({ anchorEl, open, room, onClose }: IProps) => {
  const [isFetching, setIsFetching] = useState(false)

  const dispatch = useTypedDispatch()

  useEffect(() => {
    if (open) {
      fetchParticipants({ offset: 0 })
    } else {
      dispatch(usersActions.roomPopupParticipantsDeleted({ roomId: room._id }))
    }
  }, [open])

  const fetchParticipants = async ({ offset }: { offset: number }) => {
    try {
      setIsFetching(true)

      await dispatch(
        usersActions.fetchedRoomParticipants({ roomId: room._id, offset })
      ).unwrap()
    } catch (e) {
    } finally {
      setIsFetching(false)
    }
  }

  const handleClickMore = () => {
    fetchParticipants({ offset: room.participants.length })
  }

  return (
    <ClickAwayListener onClickAway={() => onClose()}>
      <Popper open={open} anchorEl={anchorEl}>
        <Box
          sx={{
            width: '150px',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '10px',
            padding: '10px 0',
            backgroundColor: 'white',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
            overflow: 'auto',
          }}
        >
          {/* No participants */}
          {!isFetching && !room.participants.length && (
            <Typography variant='subtitle2' sx={{ textAlign: 'center' }}>
              No participants
            </Typography>
          )}
          {/* No participants */}

          {/* List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: '10px',
            }}
          >
            {room.participants.map((participant) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '10px',
                  padding: '0 5px',
                }}
              >
                <Avatar
                  sx={{ width: '35px', height: '35px' }}
                  src={participant.avatar}
                />
                <Typography variant='body1'>{participant.username}</Typography>
              </Box>
            ))}
          </Box>
          {/* List */}

          {/* Bottom */}
          <Box sx={{ marginTop: 'auto' }}>
            {isFetching ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={25} />
              </Box>
            ) : (
              <Button onClick={handleClickMore} fullWidth>
                more
              </Button>
            )}
          </Box>
          {/* Bottom */}
        </Box>
      </Popper>
    </ClickAwayListener>
  )
}
