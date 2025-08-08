import { createSlice } from '@reduxjs/toolkit';

const watchlistSlice = createSlice(
    {
        name: 'watchlist',
        initialState: {
            items: [],
        },
        reducers: {
            addtowatchlistData: (state, action) => {
               state.items.push(action.payload);
            },
            removetowatchlistData: (state, action) => {
               state.items = state.items.filter(item => item.id !== action.payload.id);
            },
            cleanwatchlistdata: (state, action) => {
               state.items = [];
            },
        },
    }
)

export const { addtowatchlistData, removetowatchlistData, cleanwatchlistdata } = watchlistSlice.actions;
export default watchlistSlice.reducer;