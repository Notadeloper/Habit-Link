import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExtraConfig = {
  API_BASE_URL: string;
};

const nativeExtra = (Constants.expoConfig?.extra) as ExtraConfig | undefined;

export const API_BASE_URL = Platform.OS === 'web'
  ? process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
  : nativeExtra?.API_BASE_URL || 'http://localhost:5000/api';

console.log("API Base URL:", API_BASE_URL);