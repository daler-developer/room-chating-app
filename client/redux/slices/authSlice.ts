import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import { AxiosError } from "axios"
import { IUser } from "../../models"
import usersService, { IAuthResponse } from "../../services/usersService"
import { initSocket, socket } from "../../socket"
import { RootState } from "../store"
import { entitiesSelectors } from "./entitiesSlice"

const fetchedMe = createAsyncThunk('auth/fetchedMe', async () => {
  const { data } = await usersService.getMe()

  return data 
})

const login = createAsyncThunk('auth/login', async ({ username, password }: { username: string, password: string }, thunkAPI) => {
  try {
    const result = await usersService.login(username, password)

    const data = result.data as IAuthResponse

    localStorage.setItem('accessToken', data.accessToken)
  
    return data
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})

const register = createAsyncThunk('auth/register', async ({ username, firstName, lastName, password,  }: { username: string, firstName: string, lastName: string, password: string }) => {
  const { data } = await usersService.register(username, firstName, lastName, password)

  localStorage.setItem('accessToken', data.accessToken)
  
  return data
})

interface IState {
  currentUser: string | null
  isFetchingMe: boolean
}

const initialState: IState = {
  currentUser: null,
  isFetchingMe: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

  },
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
  }
})

export const authActions = {
  ...authSlice.actions,
  login,
  register,
  fetchedMe
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
  }
}

export default authSlice
