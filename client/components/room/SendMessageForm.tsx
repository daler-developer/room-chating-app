import { Box, Button, IconButton, Paper, TextField } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

interface IProps {
  onSubmit: (data: IFormValues) => void
}

export interface IFormValues {
  text: string
  images: FileList | null
}

const schema = yup.object({
  text: yup.string().trim().required().max(200),
})

export default ({ onSubmit }: IProps) => {
  const form = useForm<IFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      images: null,
      text: '',
    },
  })

  const imageUrls = form.getValues('images')
    ? Array.from(form.getValues('images') as any).map((image: any) =>
        URL.createObjectURL(image)
      )
    : null

  const fileInputLabelRef = useRef<HTMLLabelElement>(null!)

  useWatch({ control: form.control, name: 'images' })

  const handleRemoveImage = (imageIndex: number) => {
    form.setValue('images', null)
  }

  return (
    <>
      <Paper
        elevation={5}
        component='form'
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          display: 'flex',
        }}
      >
        <Box sx={{ flex: '1 0 0' }}>
          <TextField
            fullWidth
            placeholder='Message...'
            sx={{ height: '100%' }}
            error={!!form.formState.errors.text}
            {...form.register('text')}
          />
        </Box>
        <Button onClick={() => fileInputLabelRef.current.click()} type='button'>
          <PhotoCameraIcon />
        </Button>
        <Button sx={{}} type='submit'>
          <SendIcon />
        </Button>

        {imageUrls && (
          <Paper
            elevation={5}
            sx={{
              position: 'absolute',
              bottom: '110%',
              left: '10px',
              display: 'flex',
              padding: '10px',
              columnGap: '10px',
            }}
          >
            {imageUrls.map((url, i) => (
              <Box
                key={i}
                sx={{ width: '200px', height: '200px', position: 'relative' }}
              >
                <Box
                  component='img'
                  src={url}
                  sx={{ width: '100%', height: '100%' }}
                />
                <IconButton
                  onClick={() => handleRemoveImage(i)}
                  color='error'
                  sx={{ position: 'absolute', top: '5px', right: '5px' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>
        )}
      </Paper>

      <label hidden ref={fileInputLabelRef}>
        <input type='file' multiple {...form.register('images')} />
      </label>
    </>
  )
}
