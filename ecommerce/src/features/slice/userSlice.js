import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLogin: false,
        userRole: '',
    },
    reducers: {
        setLogin: (state, action) => {
            state.isLogin = true;
            state.userRole = action.payload.role;
        },
        setLogout: (state) => {
            state.isLogin = false;
            state.userRole = '';
        },
    },
});

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;