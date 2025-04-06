import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export interface HistoryItem {
  id: string;
  text: string;
  responseText: string;
  audioUrl: string;
  voiceId: string;
  duration: number;
  createdAt: string;
  promptId?:string;
}

interface HistoryState {
  items: HistoryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: HistoryState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      // Update to use the correct endpoint for fetching history
      const response = await api.get(`/api/krutrim/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryItem: (state, action) => {
      // Add a new history item to the beginning of the array
      state.items.unshift(action.payload);
      state.pagination.total += 1;
    },
    clearHistory: (state) => {
      state.items = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.prompts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addHistoryItem, clearHistory } = historySlice.actions;
export default historySlice.reducer;