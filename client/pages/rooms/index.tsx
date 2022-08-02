import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import AuthProtected from '../../components/AuthProtected'
import FilterBlock from '../../components/FilterBlock'
import Layout from '../../components/Layout'
import RoomCard from '../../components/RoomCard'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import useTypedSelector from '../../hooks/useTypedSelector'
import { roomsActions, roomsSelectors } from '../../redux/slices/roomsSlice'

export interface IRoomsFilterObj {
  search?: string
  sort?: 'all' | 'public' | 'private'
  page?: number
}

const sortItems = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

const Home = () => {
  const rooms = useTypedSelector(roomsSelectors.selectFeedRooms)

  const dispatch = useTypedDispatch()

  const fetchRooms = (filterObj: IRoomsFilterObj) => {
    dispatch(roomsActions.fetchedFeedRooms(filterObj))
  }

  return (
    <Box>
      <FilterBlock
        onTriggerFetch={(filterObj) => fetchRooms(filterObj as IRoomsFilterObj)}
        totalPages={rooms.totalPages}
        sortItems={sortItems}
      />

      <Box
        sx={{
          mt: '20px',
          display: 'grid',
          gridTemplateColumns: '4',
          gap: '30px',
        }}
      >
        {rooms.isFetching ? (
          <CircularProgress />
        ) : rooms.error ? (
          <Typography color='red' sx={{ textAlign: 'center' }}>
            {rooms.error}
          </Typography>
        ) : !rooms.list.length ? (
          <Typography sx={{ textAlign: 'center' }} variant='h6'>
            No rooms
          </Typography>
        ) : (
          rooms.list.map((room) => <RoomCard room={room} key={room._id} />)
        )}
      </Box>
    </Box>
  )
}

Home.getLayout = (page: any) => {
  return (
    <AuthProtected>
      <Layout>{page}</Layout>
    </AuthProtected>
  )
}

export default Home
