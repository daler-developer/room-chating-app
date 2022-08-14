import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ErrorResponseType, IUser } from '../../types'
import usersService, { IAuthResponse } from '../../services/usersService'
import { initSocket, socket } from '../../socket'
import { RootState } from '../store'
import { entitiesSelectors, UserEntityType, userSchema } from './entitiesSlice'
import { normalize } from 'normalizr'

export interface UpdateProfileProps {
  firstName?: string
  lastName?: string
  username?: string
  avatar?: File
  removeAvatar?: boolean
}

const profileUpdated = createAsyncThunk<
  {
    result: string
    entities: { users?: UserEntityType[] }
  },
  UpdateProfileProps,
  { rejectValue: ErrorResponseType }
>('users/profileUpdated', async (updateProps, thunkAPI) => {
  try {
    const { data } = await usersService.updateProfile(updateProps)
    
    const normalized = normalize(
      data.user,
      userSchema
    )

    return { ...normalized }
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ErrorResponseType)
  }
})

const fetchedMe = createAsyncThunk('auth/fetchedMe', async () => {
  const { data } = await usersService.getMe()

  return data
})

type LoginActionArgType = { username: string; password: string }

const login = createAsyncThunk<
  IAuthResponse,
  LoginActionArgType,
  { rejectValue: ErrorResponseType }
>('auth/login', async ({ username, password }, thunkAPI) => {
  try {
    const result = await usersService.login(username, password)

    const data = result.data as IAuthResponse

    localStorage.setItem('accessToken', data.accessToken)

    return data
  } catch (e) {
    return thunkAPI.rejectWithValue(
      e as ErrorResponseType
    )
  }
})

type RegisterActionArgType = {
  username: string
  firstName: string
  lastName: string
  password: string
}

const register = createAsyncThunk<
  IAuthResponse,
  RegisterActionArgType,
  { rejectValue: ErrorResponseType }
>(
  'auth/register',
  async ({ username, firstName, lastName, password }, thunkAPI) => {
    try {
      const { data } = await usersService.register(
        username,
        firstName,
        lastName,
        password
      )

      localStorage.setItem('accessToken', data.accessToken)

      return data
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e as ErrorResponseType
      )
    }
  }
)

interface IState {
  currentUser: string | null
  isFetchingMe: boolean
}

const initialState: IState = {
  currentUser: null,
  isFetchingMe: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(login.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user._id
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user._id
      })
      .addCase(fetchedMe.pending, (state, { payload }) => {
        state.isFetchingMe = true
      })
      .addCase(fetchedMe.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user._id
        state.isFetchingMe = false
      })
      .addCase(fetchedMe.rejected, (state, { payload }) => {
        state.isFetchingMe = false
      })
  },
})

export const authActions = {
  ...authSlice.actions,
  login,
  register,
  fetchedMe,
  profileUpdated
}

export const authSelectors = {
  selectCurrentUser(state: RootState) {
    if (state.auth.currentUser) {
      return entitiesSelectors.selectUserById(state, state.auth.currentUser)
    }
    return null
  },
  selectIsFetchingMe(state: RootState) {
    return state.auth.isFetchingMe
  },
  selectIsAuthenticated(state: RootState) {
    return Boolean(state.auth.currentUser)
  },
}

export default authSlice
