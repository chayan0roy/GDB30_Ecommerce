import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice(
    {
        name: 'user',
        initialState: {
            isLogin: false,
            userRole: '',
        },
        reducers: {
            setLogin: (state, action) => {
                state.isLogin = action.payload;
                state.userRole = action.payload;
            },
            setLogout: (state, action) => {
               state.isLogin = false;
               state.userRole = '';
            },
        },
    }
)

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;