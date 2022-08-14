import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import {
  FormEvent,
  SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { io } from 'socket.io-client'
import AuthProtected from '../../components/AuthProtected'
import FilterBlock from '../../components/FilterBlock'
import Layout from '../../components/Layout'
import SearchForm from '../../components/SearchForm'
import UserCard from '../../components/UserCard'
import useDebounce from '../../hooks/useDebounce'
import useQueryParam from '../../hooks/useQueryParam'
import useTypedDispatch from '../../hooks/useTypedDispatch'
import useTypedSelector from '../../hooks/useTypedSelector'
import { IUser } from '../../types'
import { usersActions, usersSelectors } from '../../redux/slices/usersSlice'
import usersService from '../../services/usersService'

export interface IFilterObj {
  search: string
  status: 'all' | 'online' | 'offline'
  page: number
}

const statusItems = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'online',
    label: 'Online',
  },
  {
    value: 'offline',
    label: 'Offline',
  },
]

const Users = () => {
  const [filterObj, setFilterObj] = useState<IFilterObj>({
    search: '',
    status: 'all',
    page: 1,
  })

  const users = useTypedSelector(usersSelectors.selectFeedUsers)

  useEffect(() => {
    fetchUsers()
  }, [filterObj])

  const dispatch = useTypedDispatch()

  const fetchUsers = () => {
    const { page, search, status } = filterObj

    dispatch(
      usersActions.fetchedFeedUsers({
        page,
        status,
        search,
      })
    )
  }

  return (
    <>
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
              value={filterObj.status}
              onChange={(e) =>
                setFilterObj({
                  ...filterObj,
                  page: 1,
                  status: e.target.value as IFilterObj['status'],
                })
              }
            >
              {statusItems.map((item) => (
                <MenuItem value={item.value}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant='contained'>Reload</Button>

          <Pagination
            sx={{ ml: 'auto' }}
            count={users.totalPages}
            page={filterObj.page}
            onChange={(_, value) => setFilterObj({ ...filterObj, page: value })}
            size='medium'
            variant='outlined'
            shape='rounded'
            color='primary'
          />
        </Box>
      </Box>

      <Box sx={{ mt: '30px' }}>
        {users.isFetching ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : users.error ? (
          <Typography color='red' sx={{ textAlign: 'center' }}>
            {users.error}
          </Typography>
        ) : !users.list.length ? (
          <Typography sx={{ textAlign: 'center' }} variant='h6'>
            No users
          </Typography>
        ) : (
          <Box
            sx={{
              mt: '30px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '40px',
            }}
          >
            {users.list.map((user) => (
              <UserCard key={user.username} user={user} />
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}

Users.getLayout = (page: any) => {
  return (
    <AuthProtected>
      <Layout>{page}</Layout>
    </AuthProtected>
  )
}

export default Users
