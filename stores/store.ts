import { configureStore } from '@reduxjs/toolkit';  // Importing the Redux Toolkit's configureStore function
import Login from '@/stores/slices/login';          // Importing the login slice from the slices directory
import Project from '@/stores/slices/projects'; // Importing the Project type from the projects slice

// This is the Redux store configuration for the login functionality
// It uses the Redux Toolkit to create a store with a single slice for login.
const store = configureStore({
    reducer: {
        login: Login, // This is the slice for login functionality
        projects: Project, // This is the slice for project management functionality
    },
});


// Exporting the types for the root state and dispatch
// These types are useful for TypeScript to infer the types of the state and dispatch functions.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 