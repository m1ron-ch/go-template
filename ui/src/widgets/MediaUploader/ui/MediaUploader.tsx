import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { ControlledPhotoUploader, DownLoadIcon, InfoSnackbar, AppSettings } from '@/shared';
import { Button, Card, Typography } from '@mui/material';
import s from './MediaUploader.module.scss';

// Define the type for the form data
interface FormData {
  photo: File | null;
}

export const MediaUploader = () => {
  const [imageURL, setImageURL] = useState('');
  const [formState, setFormState] = useState<'error' | 'idle' | 'success'>('idle');
  const { control, handleSubmit, reset, watch } = useForm<FormData>({ defaultValues: { photo: null } });
  const imageData = watch('photo');

  useEffect(() => {
    setFormState('idle');
    if (imageData) {
      const imageURL = URL.createObjectURL(imageData);
      setImageURL(imageURL);
    }

    return () => {
      URL.revokeObjectURL(imageURL);
      setImageURL('');
    };
  }, [imageData]);

  const onFormSubmit: SubmitHandler<FormData> = async (data) => {
    if (!data.photo) return;

    const formData = new FormData();
    formData.append('file', data.photo);

    try {
      const response = await fetch(`${AppSettings.API_URL}media/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setFormState('success');
      reset();
    } catch (error) {
      console.error('Error uploading file:', error);
      setFormState('error');
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant={'h3'}>Для загрузки изображения нажмите кнопку ниже</Typography>
      <ControlledPhotoUploader control={control} name={'photo'}>
        <Button sx={{ display: 'flex', gap: '24px', width: '400px' }} variant={'contained'}>
          Загрузить
          <DownLoadIcon />
        </Button>
      </ControlledPhotoUploader>
      {imageURL && (
        <>
          <Card className={s.imageBody}>
            <img src={imageURL} title={'Загруженное изображение'} />
          </Card>
          <Button
            sx={{ display: 'flex', gap: '24px', width: '400px' }}
            type={'submit'}
            variant={'contained'}
          >
            Сохранить изображение
          </Button>
        </>
      )}
      <InfoSnackbar
        isVisible={formState === 'success'}
        message={'Изображение успешно сохранено!'}
        severity={'success'}
      />
      <InfoSnackbar
        isVisible={formState === 'error'}
        message={'Ошибка при сохранении изображения!'}
        severity={'error'}
      />
    </form>
  );
};
