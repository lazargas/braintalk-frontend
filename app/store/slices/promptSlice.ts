import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// Define interfaces for better type safety
interface PromptResponse {
  text: string;
  audioUrl?: string;
  duration?: number;
  promptId?: string;
  id?: string;
}

interface PromptState {
  prompt: string;
  response: PromptResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PromptState = {
  prompt: '',
  response: null,
  isLoading: false,
  error: null,
};

// Update the sendPrompt thunk to properly handle the API response
export const sendPrompt = createAsyncThunk(
  'prompt/sendPrompt',
  async ({ prompt, voiceId }: { prompt: string; voiceId: string }, { rejectWithValue }) => {
    try {
      console.log('Sending prompt to Krutrim API:', prompt);
      
      // First, send the prompt to the Krutrim API
      const krutrimResponse = await api.post('/api/krutrim/generate', { prompt });
      
      console.log('Krutrim API response:', krutrimResponse.data);
      
      if (!krutrimResponse.data || !krutrimResponse.data.response) {
        return rejectWithValue('Invalid response from Krutrim API');
      }
      
      // Fix: Extract the text property from the response object
      const responseText = krutrimResponse.data.response.text || '';
      const promptId = krutrimResponse.data.promptId;
      
      // Ensure we have a valid text string before sending to TTS
      if (!responseText || typeof responseText !== 'string') {
        return rejectWithValue('Invalid response text from Krutrim API');
      }
      
      // Then, send the text to the TTS API to generate audio
      console.log('Sending text to TTS API:', responseText);
      const ttsResponse = await api.post('/api/tts/generate', {
        text: responseText,
        voiceId,
      });
      
      console.log('TTS API response:', ttsResponse.data);
      
      // Make sure we're using the correct property for the audio URL
      const audioUrl = ttsResponse.data.url || ttsResponse.data.audioUrl || '';
      
      // Return a combined response with all the data we need
      return {
        text: responseText,
        promptId: promptId || ttsResponse.data.promptId,
        audioUrl: audioUrl,
        duration: ttsResponse.data.duration || 0,
        id: ttsResponse.data.id || Date.now().toString(),
      };
    } catch (error) {
      console.error('Error in sendPrompt:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to send prompt');
    }
  }
);

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setPrompt: (state, action) => {
      state.prompt = action.payload;
    },
    setResponse: (state, action) => {
      state.response = action.payload;
    },
    clearPrompt: (state) => {
      state.prompt = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPrompt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPrompt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.response = action.payload;
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPrompt, setResponse, clearPrompt } = promptSlice.actions;
export default promptSlice.reducer;