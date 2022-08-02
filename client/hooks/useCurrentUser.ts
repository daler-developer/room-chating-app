import { authSelectors } from '../redux/slices/authSlice'
import useTypedSelector from './useTypedSelector'

export default () => {
  return useTypedSelector(authSelectors.selectCurrentUser)
}
