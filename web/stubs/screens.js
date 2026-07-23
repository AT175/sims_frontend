import React from 'react';
import { View } from 'react-native';

export const enableScreens = () => {};
export const enableFreeze = () => {};

export const Screen = ({ children }) => React.createElement(View, { style: { flex: 1 } }, children);
export const ScreenContainer = ({ children }) => React.createElement(View, { style: { flex: 1 } }, children);
export default { Screen, ScreenContainer, enableScreens, enableFreeze };
