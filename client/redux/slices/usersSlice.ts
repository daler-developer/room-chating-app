import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { normalize } from 'normalizr'
import { IErrorResponse, IUser } from '../../types'
import { IUsersFilterObj } from '../../pages/users'
import usersService from '../../services/usersService'
import { RootState } from '../store'
import { entitiesSelectors, UserEntityType, userSchema } from './entitiesSlice'
import { AxiosError } from 'axios'

const userLoggedIn = createAction<{ userId: string }>('users/userLoggedIn')
const userLoggedOut = createAction<{ userId: string }>('users/userLoggedOut')

const fetchedFeedUsers = createAsyncThunk(
  'users/fetchedFeedUsers',
  async (filterObj: IUsersFilterObj, thunkAPI) => {
    try {
      const { data } = await usersService.getUsers(filterObj)

      const normalized = normalize<any, { users: UserEntityType[] }>(
        data.users,
        [userSchema]
      )

      return {
        ...normalized,
        totalPages: data.totalPages,
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        return thunkAPI.rejectWithValue(e.response!.data)
      }
    }
  }
)

const fetchedUser = createAsyncThunk<
  { user: IUser },
  { userId: string },
  { rejectValue: IErrorResponse }
>('users/fetchedUser', async ({ userId }, thunkAPI) => {
  try {
    const { data } = await usersService.getUser({ userId })

    return data
  } catch (e) {
    return thunkAPI.rejectWithValue(
      (e as AxiosError<IErrorResponse>).response!.data
    )
  }
})

interface IState {
  profile: {
    user: string | null
    isFetching: boolean
    error: string | null
  }
  feed: {
    list: string[]
    totalPages: number
    isFetching: boolean
    error: string | null
  }
}

const initialState: IState = {
  profile: {
    user: null,
    isFetching: false,
    error: null,
  },
  feed: {
    list: [],
    totalPages: 0,
    isFetching: false,
    error: null,
  },
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    changedUserOnlineStatus(
      state,
      { payload }: PayloadAction<{ userId: string; to: boolean }>
    ) {
      // state.feed.list = state.feed.list.map((user) => user._id === payload.userId ? ({ ...user, isOnline: payload.to }) : user)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchedFeedUsers.pending, (state, { payload }) => {
        state.feed.isFetching = true
      })
      .addCase(fetchedFeedUsers.fulfilled, (state, { payload }) => {
        state.feed.list = payload!.result
        state.feed.totalPages = payload!.totalPages
        state.feed.isFetching = false
        state.feed.error = null
      })
      .addCase(fetchedFeedUsers.rejected, (state, { payload }) => {
        state.feed.error = (payload as { message: string }).message
        state.feed.isFetching = false
      })
      .addCase(fetchedUser.pending, (state, { payload }) => {
        state.profile.error = null
        state.profile.isFetching = true
      })
      .addCase(fetchedUser.fulfilled, (state, { payload }) => {
        state.profile.isFetching = false
        state.profile.user = payload.user._id
      })
      .addCase(fetchedUser.rejected, (state, { payload }) => {
        state.profile.isFetching = false
        state.profile.error = payload!.message
      })
  },
})

export const usersActions = {
  ...usersSlice.actions,
  fetchedFeedUsers,
  userLoggedIn,
  userLoggedOut,
  fetchedUser
}

export const usersSelectors = {
  selectFeedUsers(state: RootState) {
    return {
      list: entitiesSelectors.selectUsersByIds(state, state.users.feed.list),
      isFetching: state.users.feed.isFetching,
      error: state.users.feed.error,
      totalPages: state.users.feed.totalPages,
    }
  },
  selectProfileUser(state: RootState) {
    return {
      user: state.users.profile.user
        ? entitiesSelectors.selectUserById(state, state.users.profile.user)
        : null,
      isFetching: state.users.profile.isFetching,
      error: state.users.profile.error,
    }
  },
}

export default usersSlice
