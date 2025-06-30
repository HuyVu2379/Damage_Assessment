import { DefaultTheme } from 'react-native-paper';
import { moderateScale } from './scaling';

export const theme = {
    ...DefaultTheme,
    roundness: moderateScale(12),
    colors: {
        ...DefaultTheme.colors,
        primary: '#4a6fa5',
        accent: '#19a0c9',
    },
};
