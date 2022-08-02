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
import FilterBlock, { IFilterObj } from '../../components/FilterBlock'
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

export interface IUsersFilterObj {
  search?: string
  sort?: 'all' | 'online' | 'offline'
  page?: number
}

const sortItems = [
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
  const users = useTypedSelector(usersSelectors.selectFeedUsers)

  const dispatch = useTypedDispatch()

  const fetchUsers = ({ page, sort, search }: IUsersFilterObj) => {
    dispatch(
      usersActions.fetchedFeedUsers({
        page,
        sort,
        search,
      })
    )
  }

  return (
    <>
      <FilterBlock
        onTriggerFetch={(filterObj) => fetchUsers(filterObj as IUsersFilterObj)}
        totalPages={users.totalPages}
        sortItems={sortItems}
      />

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
