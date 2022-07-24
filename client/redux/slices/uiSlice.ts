import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export enum ModalsEnum {
  JOIN_ROOM,
  DELETE_ROOM
}

interface IState {
  currentActiveModal: ModalsEnum | null
}

const initialState: IState = {
  currentActiveModal: null
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
    }
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
}

export default uiSlice
