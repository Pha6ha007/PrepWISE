# S02: Voice Silence Auto-Stop — UAT

## How to Test

1. **Prerequisites:** Must be on Pro or Premium plan (or temporarily set plan to 'pro' in DB) to access voice features.

2. **Auto-stop on silence:**
   - Navigate to `/dashboard/chat`
   - Toggle to voice input mode
   - Press and hold the mic button, speak a sentence, then go silent
   - Recording should auto-stop after ~1.5 seconds of silence
   - Transcription should fire and message should be sent

3. **Manual stop still works:**
   - Press and hold the mic button
   - Speak, then release the button while still talking
   - Recording should stop immediately on release

4. **Status text:**
   - During recording, should show "Listening..." (not "Recording...")
   - Should show "Auto-stops on silence · or release to send"

5. **Edge case — very noisy environment:**
   - In noisy conditions, auto-stop may take longer (background noise keeps RMS above threshold)
   - Manual release should always work as fallback
