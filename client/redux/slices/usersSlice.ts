import { createAction, createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { IUsersFilterObj, IUser } from "../../models";
import usersService from "../../services/usersService";
import { RootState } from "../store";
import { entitiesSelectors, UserEntityType, userSchema } from "./entitiesSlice"
import { AxiosError } from 'axios'

const userLoggedIn = createAction<{ userId: string }>('users/userLoggedIn')
const userLoggedOut = createAction<{ userId: string }>('users/userLoggedOut')

const fetchedFeedUsers = createAsyncThunk('users/fetchedFeedUsers', async (filterObj: IUsersFilterObj, thunkAPI) => {
  try {
    const { data } = await usersService.getUsers(filterObj)

    const normalized = normalize<any, { users: UserEntityType[] }>(data.users, [userSchema])
    
    return {
      ...normalized,
      totalPages: data.totalPages
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      return thunkAPI.rejectWithValue(e.response!.data)
    }
  }
})

interface IState {
  feed: {
    list: string[]
    totalPages: number
    isFetching: boolean
    error: string | null
  }
}

const initialState: IState = {
  feed: {
    list: [],
    totalPages: 0,
    isFetching: false,
    error: null
  }
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    changedUserOnlineStatus(state, { payload }: PayloadAction<{ userId: string, to: boolean }>) {
      // state.feed.list = state.feed.list.map((user) => user._id === payload.userId ? ({ ...user, isOnline: payload.to }) : user)
    }
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
      })
      .addCase(fetchedFeedUsers.rejected, (state, { payload }) => {
        state.feed.error = (payload as { message: string }).message
        state.feed.isFetching = false
      })
  }
})

export const usersActions = {
  ...usersSlice.actions,
  fetchedFeedUsers,
  userLoggedIn,
  userLoggedOut
}

export const usersSelectors = {
  selectFeedUsers(state: RootState) {
    return {
      list: entitiesSelectors.selectUsersByIds(state, state.users.feed.list),
      isFetching: state.users.feed.isFetching,
      error: state.users.feed.error,
      totalPages: state.users.feed.totalPages
    }
  }
}

export default usersSlice
