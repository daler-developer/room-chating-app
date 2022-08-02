import {
  Avatar,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AuthProtected from '../../components/AuthProtected'
import FullScreenLoader from '../../components/FullScreenLoader'
import Layout from '../../components/Layout'
import RoomCard from '../../components/RoomCard'
import useQueryParam from '../../hooks/useQueryParam'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import useTypedSelector from '../../hooks/useTypedSelector'
import { roomsActions, roomsSelectors } from '../../redux/slices/roomsSlice'
import { usersActions, usersSelectors } from '../../redux/slices/usersSlice'

export default function UserDetail() {
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  const [userId] = useQueryParam('_id')

  const router = useRouter()

  const dispatch = useTypedDispatch()

  const { user, error, isFetching } = useTypedSelector(
    usersSelectors.selectProfileUser
  )
  const {
    list: roomsCreated,
    isFetching: isFetchingRoomsCreated,
    error: fetchingRoomsCreatedError,
  } = useTypedSelector(roomsSelectors.selectRoomsUserCreated)
  const {
    list: roomsJoined,
    isFetching: isFetchingRoomsJoined,
    error: fetchingRoomsJoinedError,
  } = useTypedSelector(roomsSelectors.selectRoomsUserJoined)

  useEffect(() => {
    ;(async () => {
      if (router.isReady) {
        await dispatch(usersActions.fetchedUser({ userId }))

        setIsFullScreenVisible(false)
      }
    })()
  }, [router.isReady])

  useEffect(() => {
    ;(async () => {
      if (router.isReady) {
        switch (activeTab) {
          case 0:
            await dispatch(roomsActions.fetchedRoomsUserCreated({ userId }))
            break
          case 1:
            await dispatch(roomsActions.fetchedRoomsUserJoined({ userId }))
            break
        }
      }
    })()
  }, [router.isReady, activeTab])

  if (isFullScreenVisible) {
    return <FullScreenLoader />
  }

  if (error) {
    return <Box>error</Box>
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: '20px',
        }}
      >
        <Avatar sx={{ width: '80px', height: '80px' }} src={user!.avatar} />
        <Typography variant='h4'>{user!.username}</Typography>
      </Box>

      {/* <Typography sx={{ mt: '40px', textAlign: 'center' }} variant="h4">
      Rooms
    </Typography> */}

      <Tabs
        sx={{ mt: '20px' }}
        variant='fullWidth'
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab label='Created' />
        <Tab label='Joined' />
      </Tabs>

      <Box
        sx={{
          mt: '20px',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '10px',
        }}
      >
        {activeTab === 0 ? (
          // TAB: CREATED
          isFetchingRoomsCreated ? (
            <CircularProgress />
          ) : fetchingRoomsCreatedError ? (
            <Typography>{fetchingRoomsCreatedError}</Typography>
          ) : !roomsCreated.length ? (
            <Typography sx={{ textAlign: 'center ' }}>
              No rooms created
            </Typography>
          ) : (
            roomsCreated.map((room) => <RoomCard key={room._id} room={room} />)
          )
        ) : (
          // TAB: JOINED
          activeTab === 1 &&
          (isFetchingRoomsJoined ? (
            <CircularProgress />
          ) : fetchingRoomsJoinedError ? (
            <Typography>{fetchingRoomsJoinedError}</Typography>
          ) : !roomsJoined.length ? (
            <Typography sx={{ textAlign: 'center ' }}>
              No rooms joined
            </Typography>
          ) : (
            roomsJoined.map((room) => <RoomCard key={room._id} room={room} />)
          ))
        )}
      </Box>
    </>
  )
}

UserDetail.getLayout = (page: any) => {
  return (
    <AuthProtected>
      <Layout>{page}</Layout>
    </AuthProtected>
  )
}
