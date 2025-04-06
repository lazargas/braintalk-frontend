import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Remove unused API_URL constant since we're using the api utility

interface Voice {
  id: string;
  name: string;
  description: string;
  preview_url: string;
}

interface VoiceState {
  voices: Voice[];
  selectedVoice: Voice | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VoiceState = {
  voices: [],
  selectedVoice: null,
  isLoading: false,
  error: null,
};

// Add /api prefix to voice-related endpoints
export const fetchVoices = createAsyncThunk(
  "voice/fetchVoices",
  async (_, { rejectWithValue }) => {
    try {
      // Use the correct endpoint with /api prefix
      const response = await api.get("/api/tts/voices");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch voices"
      );
    }
  }
);

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    selectVoice: (state, action) => {
      state.selectedVoice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.voices = action.payload;
        if (action.payload.length > 0 && !state.selectedVoice) {
          state.selectedVoice = action.payload[0];
        }
      })
      .addCase(fetchVoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectVoice } = voiceSlice.actions;
export default voiceSlice.reducer;
