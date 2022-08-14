import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AuthProtected from '../../components/AuthProtected'
import Layout from '../../components/Layout'
import RoomCard from '../../components/room-card/RoomCard'
import SearchForm from '../../components/SearchForm'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import useTypedSelector from '../../hooks/useTypedSelector'
import { roomsActions, roomsSelectors } from '../../redux/slices/roomsSlice'

export interface IFilterObj {
  search: string
  access: 'all' | 'public' | 'private'
  page: number
}

const sortItems = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

const Home = () => {
  const [filterObj, setFilterObj] = useState<IFilterObj>({
    search: '',
    access: 'all',
    page: 1,
  })

  useEffect(() => {
    fetchRooms(filterObj)
  }, [filterObj])

  const rooms = useTypedSelector(roomsSelectors.selectFeedRooms)

  const dispatch = useTypedDispatch()

  const fetchRooms = (filterObj: IFilterObj) => {
    dispatch(roomsActions.fetchedFeedRooms(filterObj))
  }

  return (
    <Box>
      <Box>
        <SearchForm
          value={filterObj.search}
          onChange={(e) =>
            setFilterObj({
              ...filterObj,
              page: 1,
              search: e.currentTarget.value,
            })
          }
        />

        <Box
          sx={{
            mt: '20px',
            display: 'flex',
            alignItems: 'center',
            columnGap: '15px',
          }}
        >
          <FormControl size='small'>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={filterObj.access}
              onChange={(e) =>
                setFilterObj({
                  ...filterObj,
                  page: 1,
                  access: e.target.value as IFilterObj['access'],
                })
              }
            >
              {sortItems.map((item) => (
                <MenuItem value={item.value}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant='contained' onClick={() => {}}>
            Reload
          </Button>

          <Pagination
            sx={{ ml: 'auto' }}
            count={rooms.totalPages}
            page={filterObj.page}
            onChange={(_, value) => setFilterObj({ ...filterObj, page: value })}
            size='medium'
            variant='outlined'
            shape='rounded'
            color='primary'
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: '20px',
          display: 'grid',
          gridTemplateColumns: '4',
          gap: '30px',
        }}
      >
        {rooms.isFetching ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
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
