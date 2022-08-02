import { useDispatch } from 'react-redux'
import { AppDispatch } from '../redux/store'

const useTypedDispatch = (): AppDispatch => {
  return useDispatch()
}

export default useTypedDispatch
