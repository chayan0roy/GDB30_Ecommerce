import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice(
    {
        name: 'cart',
        initialState: {
            items: [],
        },
        reducers: {
            addtocartData: (state, action) => {
               state.items.push(action.payload);
            },
            removetocartData: (state, action) => {
               state.items = state.items.filter(item => item.id !== action.payload.id);
            },
            cleanCartdata: (state, action) => {
               state.items = [];
            },
        },
    }
)

export const { setLogin, setLogout } = cartSlice.actions;
export default cartSlice.reducer;