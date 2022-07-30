import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { IErrorResponse } from '../../types'
import { RootState } from '../store'
import { authActions } from './authSlice'

export enum ModalsEnum {
  JOIN_ROOM,
  DELETE_ROOM,
  UPDATE_PROFILE
}

interface IState {
  currentActiveModal: ModalsEnum | null
  alert: {
    isOpen: boolean
    message: string | null
  }
}

const initialState: IState = {
  currentActiveModal: null,
  alert: {
    isOpen: false,
    message: null
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    changedCurrentActiveModal(state, { payload }: PayloadAction<ModalsEnum>) {
      state.currentActiveModal = payload
    },
    closedCurrentActiveModal(state) {
      state.currentActiveModal = null
    },
    closeAlert(state) {
      state.alert = { isOpen: false, message: null }
    },
    openAlert(state, { payload }: PayloadAction<string>) {
      state.alert = { isOpen: true, message: payload }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(authActions.login.rejected, (state, { payload }) => {
        switch (payload!.errorCode) {
          case 'unknown_error':
            state.alert = { isOpen: true, message: payload!.message }
        }
      })
      .addCase(authActions.register.rejected, (state, { payload }) => {
        switch (payload!.errorCode) {
          case 'unknown_error':
            state.alert = { isOpen: true, message: payload!.message }
        }
      })
  }
})

export const uiActions = {
  ...uiSlice.actions,
}

export const uiSelectors = {
  selectIsJoinRoomOpen(state: RootState): boolean {
    return state.ui.currentActiveModal === ModalsEnum.JOIN_ROOM
  },
  selectIsDeleteRoomModalOpen(state: RootState): boolean {
    return state.ui.currentActiveModal === ModalsEnum.DELETE_ROOM
  },
  selectIsUpdateProfileModalOpen(state: RootState): boolean {
    return state.ui.currentActiveModal === ModalsEnum.UPDATE_PROFILE
  },
  selectAlert(state: RootState) {
    return state.ui.alert
  },
}

export default uiSlice
