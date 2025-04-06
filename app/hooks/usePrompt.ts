import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPrompt, sendPrompt } from '../store/slices/promptSlice';

export function usePrompt() {
  const dispatch = useDispatch<AppDispatch>();
  const { prompt, response, history, isLoading, error } = useSelector(
    (state: RootState) => state.prompt
  );

  return {
    prompt,
    response,
    history,
    isLoading,
    error,
    setPrompt: (text: string) => dispatch(setPrompt(text)),
    sendPrompt: (text: string, voiceId: string) => 
      dispatch(sendPrompt({ prompt: text, voiceId })),
  };
}