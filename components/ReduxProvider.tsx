'use client';
// This file is a Redux provider component that wraps the application with the Redux store.
import { Provider } from 'react-redux';  // Importing the Provider component from react-redux to connect the store to the React app
import store from '@/stores/store';      // Importing the Redux store from the store file

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
} 