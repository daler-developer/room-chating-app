import { Snackbar, Alert as MuiAlert } from "@mui/material"
import useTypedDispatch from "../hooks/useTypedDispatch"
import useTypedSelector from "../hooks/useTypedSelector"
import { uiActions, uiSelectors } from "../redux/slices/uiSlice"

export default () => {
  const { isOpen, message } = useTypedSelector(uiSelectors.selectAlert)

  const dispatch = useTypedDispatch() 

  return (
    <Snackbar open={isOpen} onClose={() => dispatch(uiActions.closeAlert())}>
      <MuiAlert severity="error">
        {message}
      </MuiAlert>
    </Snackbar>
  )
}
