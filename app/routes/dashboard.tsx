import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@remix-run/react";
import { AppDispatch, RootState } from "../store";
import { fetchVoices, selectVoice } from "../store/slices/voiceSlice";
import { setPrompt, sendPrompt } from "../store/slices/promptSlice";
import PageTransition from "../components/PageTransition";
import Skeleton from "../components/Skeleton";
import Header from "../components/Header";
import AudioPlayer from "../components/AudioPlayer";
import { motion } from "framer-motion";
import { fetchHistory, addHistoryItem } from '../store/slices/historySlice';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const {
    voices,
    selectedVoice,
    isLoading: voicesLoading,
  } = useSelector((state: RootState) => state.voice);
  const {
    prompt,
    response,
    isLoading: promptLoading,
  } = useSelector((state: RootState) => state.prompt);
  // Get history from the history slice
  const { items: historyItems, loading: historyLoading } = useSelector((state: RootState) => state.history);
  
  const [errorMessage, setErrorMessage] = useState("");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [showFullResponse, setShowFullResponse] = useState(false);
  
  // Fetch voices and history when component mounts
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    dispatch(fetchVoices());
    dispatch(fetchHistory({}));
  }, [token, dispatch, navigate]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setPrompt(e.target.value));
    // Clear any error messages when user types
    if (errorMessage) setErrorMessage("");
  };

  // REMOVED duplicate handleSubmit function here

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find((v) => v.id === e.target.value);
    if (voice) {
      dispatch(selectVoice(voice));
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!prompt.trim() || !selectedVoice || promptLoading) {
        setErrorMessage(
          "Please enter a prompt and select a voice before sending."
        );
      } else {
        sendButtonRef.current?.click();
      }
    }
  };

  // Format date for history items
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  // Function to toggle showing full response
  const toggleResponseView = () => {
    setShowFullResponse(!showFullResponse);
  };
  
  // Function to format response text with line limit
  const formatResponseText = (text: string) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    if (lines.length <= 5 || showFullResponse) {
      return text;
    }
    
    return lines.slice(0, 5).join('\n') + '...';
  };
  
  // Merged handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedVoice) {
      setErrorMessage(
        "Please enter a prompt and select a voice before sending."
      );
      return;
    }
    
    try {
      // Use the existing sendPrompt action from your Redux store
      const resultAction = await dispatch(sendPrompt({ 
        prompt, 
        voiceId: selectedVoice.id 
      }));
      
      // Log the result for debugging
      console.log('API Response:', resultAction);
      
      // Check if the action was successful
      if (sendPrompt.fulfilled.match(resultAction)) {
        const result = resultAction.payload;
        
        // Make sure we have a valid result before proceeding
        if (result) {
          // Add to history in Redux with proper fallbacks for all fields
          dispatch(addHistoryItem({
            id: result.promptId || result.id || Date.now().toString(),
            text: prompt,
            responseText: result.text || '',
            audioUrl: result.audioUrl || '',
            voiceId: selectedVoice.id,
            duration: result.duration || 0,
            createdAt: new Date().toISOString(),
          }));
          
          // Clear the prompt input after successful submission
          dispatch(setPrompt(''));
        } else {
          throw new Error('Received empty response from server');
        }
      } else if (sendPrompt.rejected.match(resultAction)) {
        // Handle rejected action explicitly
        throw new Error(resultAction.error.message || 'Request failed');
      }
    } catch (error: any) {
      console.error('Error sending prompt:', error);
      setErrorMessage(error.message || 'Failed to get response');
    }
  };
  
  // Function to load a history item
  const loadHistoryItem = (item: any) => {
    dispatch(setResponse({
      text: item.responseText,
      audioUrl: item.audioUrl,
      duration: item.duration,
      id: item.id,
      promptId: item.promptId,
    }));
  };

  return (
    <PageTransition>
      <div className="dashboard-container" onKeyDown={handleKeyDown}>
        <Header />

        <div className="dashboard-content">
          {/* History Section (Left Panel) - Hidden on mobile */}
          <div className="history-section desktop-only">
            <div className="section-title">
              <span className="section-icon" aria-hidden="true">📜</span>
              <h2>History</h2>
            </div>
            
            {historyLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading history...</p>
              </div>
            ) : historyItems && historyItems.length > 0 ? (
              <div className="history-list">
                {historyItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="history-item"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => loadHistoryItem(item)}
                  >
                    <div className="history-text">{item.text}</div>
                    <div className="history-meta">
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.audioUrl && (
                      <div className="history-audio">
                        <AudioPlayer audioUrl={item.audioUrl} duration={item.duration || 0} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <span aria-hidden="true">📝</span>
                <p>No history yet</p>
                <p className="small-text">Your conversation history will appear here</p>
              </div>
            )}
          </div>

          {/* Prompt Section (Center Panel) */}
          <div className="prompt-section">
            <div className="section-title">
              <span className="section-icon" aria-hidden="true">
                💬
              </span>
              <h2>Please Generate Brainrot</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="voice-select">Select Voice</label>
                {voicesLoading ? (
                  <Skeleton height="40px" />
                ) : (
                  <motion.select
                    id="voice-select"
                    className="form-control"
                    value={selectedVoice?.id || ""}
                    onChange={handleVoiceChange}
                    disabled={voicesLoading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    aria-label="Select a voice for the AI response"
                  >
                    <option value="" disabled>
                      Choose a voice
                    </option>
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </motion.select>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="prompt">
                  Your Prompt
                  <div className="keyboard-shortcut">
                    Press <span>⌘</span>+<span>Enter</span> to send
                  </div>
                </label>
                <motion.textarea
                  id="prompt"
                  ref={promptInputRef}
                  className="form-control"
                  rows={5}
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Type your prompt here..."
                  disabled={promptLoading}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  aria-label="Enter your prompt for the AI"
                ></motion.textarea>
              </div>
              {errorMessage && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                >
                  {errorMessage}
                </motion.div>
              )}
              <motion.button
                ref={sendButtonRef}
                type="submit"
                className="btn btn-primary"
                disabled={promptLoading || !prompt.trim() || !selectedVoice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                aria-label={
                  promptLoading
                    ? "Processing your request"
                    : "Send prompt to AI"
                }
              >
                {promptLoading ? "Processing..." : "Send"}{" "}
                <span aria-hidden="true">➤</span>
              </motion.button>
            </form>
          </div>

          {/* Response Section (Right Panel) */}
          <div className="response-section">
            <div className="section-title">
              <span className="section-icon" aria-hidden="true">
                🔊
              </span>
              <h2>Response</h2>
            </div>
            {promptLoading ? (
              <div
                className="response-loading"
                aria-live="polite"
                aria-busy="true"
              >
                <Skeleton height="100px" />
                <Skeleton height="20px" width="80%" />
                <Skeleton height="20px" width="60%" />
                <p className="sr-only">Loading response...</p>
              </div>
            ) : response ? (
              <motion.div
                className="response-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                tabIndex={0}
                aria-label="AI response"
              >
                <p>{formatResponseText(response.text)}</p>
                
                {/* Show More button - only appears if response is > 5 lines */}
                {response.text.split('\n').length > 5 && (
                  <motion.button
                    className="btn-show-more"
                    onClick={toggleResponseView}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {showFullResponse ? 'Show Less' : 'Show More'}
                  </motion.button>
                )}
                
                <AudioPlayer
                  audioUrl={response.audioUrl}
                  duration={response.duration}
                />
              </motion.div>
            ) : (
              <div className="no-response">
                <span aria-hidden="true" style={{ fontSize: "2rem" }}>
                  🎙️
                </span>
                <p>Send a prompt to get a response</p>
                <p className="small-text">The AI response will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
