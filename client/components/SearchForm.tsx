import { InputAdornment, TextField } from '@mui/material'
import { Search } from '@mui/icons-material'
import { SyntheticEvent, useEffect, useState } from 'react'
import useDebounce from '../hooks/useDebounce'

interface IProps {
  value: string
  onChange: (e: SyntheticEvent) => void
}

export default ({ value, onChange }: IProps) => {
  return (
    <TextField
      size='small'
      fullWidth
      placeholder='Search'
      value={value}
      onChange={onChange}
      sx={{ bgcolor: 'white' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <Search />
          </InputAdornment>
        ),
      }}
    />
  )
}
