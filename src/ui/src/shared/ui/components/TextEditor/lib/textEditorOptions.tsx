import { ReactNode } from 'react'

import {
  BlueDarkIcon,
  BlueLightIcon,
  CoralDarkIcon,
  CoralLightIcon,
  DarkIcon,
  GreenDarkIcon,
  GreenLightIcon,
  GreyIcon,
  OrangeDarkIcon,
  OrangeLightIcon,
  RedDarkIcon,
  RedLightIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TurquoiseDarkIcon,
  TurquoiseLightIcon,
  VioletDarkIcon,
  VioletLightIcon,
} from '../../../assets'
import { Typography } from '../../Typography'
import { COLORS } from './colors'

export const headingOptions: { title: ReactNode; value: string }[] = [
  {
    title: 'Normal text',
    value: '0',
  },
  {
    title: 'Heading 1',
    value: '1',
  },
  {
    title: 'Heading 2',
    value: '2',
  },
  {
    title: 'Heading 3',
    value: '3',
  },
]
export const compositeHeadingOptions: { title: ReactNode; value: string }[] = [
  {
    title: <Typography variant={'bodyRegular2'}>Normal text</Typography>,
    value: '0',
  },
  {
    title: <Typography variant={'h1'}>Heading 1</Typography>,
    value: '1',
  },
  {
    title: <Typography variant={'h2'}>Heading 2</Typography>,
    value: '2',
  },
  {
    title: <Typography variant={'h3'}>Heading 3</Typography>,
    value: '3',
  },
]

export const textAlignOptions: { title: ReactNode; value: string }[] = [
  {
    title: <TextAlignLeftIcon />,
    value: 'left',
  },
  {
    title: <TextAlignRightIcon />,
    value: 'center',
  },
  {
    title: <TextAlignCenterIcon />,
    value: 'right',
  },
  {
    title: <TextAlignJustifyIcon />,
    value: 'justify',
  },
]

export const compositeTextAlignOptions: { title: ReactNode; value: string }[] = [
  {
    title: (
      <>
        <TextAlignLeftIcon />
        <span> left</span>
      </>
    ),
    value: 'left',
  },
  {
    title: (
      <>
        <TextAlignRightIcon />
        <span> center</span>
      </>
    ),
    value: 'center',
  },
  {
    title: (
      <>
        <TextAlignLeftIcon />
        <span> right</span>
      </>
    ),
    value: 'right',
  },
  {
    title: (
      <>
        <TextAlignJustifyIcon />
        <span> justify</span>
      </>
    ),
    value: 'justify',
  },
]

export const colorOptions: { title: ReactNode; value: string }[] = [
  {
    title: <DarkIcon />,
    value: COLORS.DARK,
  },
  {
    title: <VioletLightIcon />,
    value: COLORS.VIOLET_LIGHT,
  },
  {
    title: <BlueLightIcon />,
    value: COLORS.BLUE_LIGHT,
  },
  {
    title: <TurquoiseLightIcon />,
    value: COLORS.TURQUOISE_LIGHT,
  },
  {
    title: <GreenLightIcon />,
    value: COLORS.GREEN_LIGHT,
  },
  {
    title: <OrangeLightIcon />,
    value: COLORS.ORANGE_LIGHT,
  },
  {
    title: <RedLightIcon />,
    value: COLORS.RED_LIGHT,
  },
  {
    title: <CoralLightIcon />,
    value: COLORS.CORAL_LIGHT,
  },
  {
    title: <GreyIcon />,
    value: COLORS.GREY,
  },
  {
    title: <VioletDarkIcon />,
    value: COLORS.VIOLET_DARK,
  },
  {
    title: <BlueDarkIcon />,
    value: COLORS.BLUE_DARK,
  },
  {
    title: <TurquoiseDarkIcon />,
    value: COLORS.TURQUOISE_DARK,
  },
  {
    title: <GreenDarkIcon />,
    value: COLORS.GREEN_DARK,
  },
  {
    title: <OrangeDarkIcon />,
    value: COLORS.ORANGE_DARK,
  },
  {
    title: <RedDarkIcon />,
    value: COLORS.RED_DARK,
  },
  {
    title: <CoralDarkIcon />,
    value: COLORS.CORAL_DARK,
  },
]
