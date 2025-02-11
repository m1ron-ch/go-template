import s from './ImageCard.module.scss'

import { CopyIcon, CornerIcon } from '../../assets'
import { InfoSnackbar } from '../InfoSnackbar'
type Props = {
  onCopyImagePath: () => void
  onRemoveImage: () => void
  src: string
  urlAddress: string
}

export const ImageCard = ({ onCopyImagePath, onRemoveImage, src, urlAddress }: Props) => {
  return (
    <div className={s.root}>
      <img src={src} title={'Image collection'} />
      <div className={s.removeIcon} onClick={onRemoveImage}>
        <CornerIcon />
      </div>
      <div className={s.copyIcon} onClick={onCopyImagePath}>
        <CopyIcon />
      </div>
      <InfoSnackbar
        isVisible={src === urlAddress}
        message={'Адрес скопирован'}
        severity={'success'}
      />
    </div>
  )
}
