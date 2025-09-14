# Troubleshooting Guide

## Common Issues and Solutions

### 1. Ollama Connection Issues

#### Symptoms
- "Cannot connect to Ollama" error
- Spinner never stops
- No response from AI

#### Check Ollama Status
```bash
# Check if Ollama is running
ollama list

# Check Ollama service
curl http://localhost:11434/api/tags

# Check if port is listening
lsof -i :11434

# Start Ollama if not running
ollama serve
```

#### Fix Port Mismatch
The app expects Ollama on port 11434. If using a different port:
1. Update `frontend/src/services/ollamaService.js`
2. Change `http://localhost:3001/api/ollama` to your port

### 2. Generation Timeouts

#### Symptoms
- "Request timeout" error after 5 minutes
- Specification generation fails silently
- Console shows: `timeout of 300000ms exceeded`

#### Why It Happens
- Complex prompts (>5KB) take longer to process
- Mistral model is slower on some hardware
- System resources are limited

#### Solutions

**Quick Fix - Use Smaller Model:**
```bash
# Switch to faster model
ollama pull llama3.2:1b
# In app settings, select llama3.2:1b
```

**Check Processing Status:**
```bash
# Monitor backend logs
# Look for "Ollama generate request received" without matching "response received"

# Check if Ollama is still processing
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"mistral:7b-instruct","prompt":"test","stream":false}' \
  -H "Content-Type: application/json"
# If this hangs, Ollama is busy
```

**Monitor System Resources:**
```bash
# Check CPU usage
top
# Look for ollama process using high CPU

# On macOS
Activity Monitor → Search "ollama"

# Check memory
free -h  # Linux
vm_stat  # macOS
```

### 3. Checking Request Status

#### In Browser Console (F12)
```javascript
// Check for errors
// Look for "Generation error:" or timeout messages

// Check network tab
// Look for pending requests to localhost:3001
```

#### In Backend Logs
```bash
# The backend logs show request flow
# Request: "Ollama generate request received: { model: 'mistral:7b-instruct', promptLength: 5053 }"
# Response: "Ollama response received, length: 2434"
# If no response line, still processing or timed out
```

#### Direct Ollama Check
```bash
# Test if Ollama is responsive
time curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"mistral:7b-instruct","prompt":"Hi","stream":false}' \
  -H "Content-Type: application/json"
# Should respond in <5 seconds for simple prompt
```

### 4. Specification Generation Specific Issues

#### Problem: Generate button doesn't work
- Check PRD is complete (all sections have content)
- Verify assessment shows "Ready to Generate"
- Check browser console for errors

#### Problem: Generation times out
**Reduce Prompt Size:**
1. Shorten engineering notes
2. Simplify PRD content
3. Use fewer template sections

**Increase Timeout:**
Edit `frontend/src/services/ollamaService.js`:
```javascript
timeout: 300000 // Change to 600000 for 10 minutes
```

### 5. Performance Optimization

#### Use Streaming (Better UX)
Currently uses `stream: false` which gives no progress updates.
Future improvement: implement streaming for real-time feedback.

#### Use Smaller Models for Assessment
Assessment only needs "SUFFICIENT" or "NEEDS_INFO" response.
Consider using `llama3.2:1b` for assessments, larger model for generation.

#### Batch Processing
Instead of one large prompt, break into sections:
1. Generate technical stack first
2. Then architecture
3. Then implementation details

### 6. Debug Mode

#### Enable Verbose Logging
Add to `frontend/src/services/ollamaService.js`:
```javascript
console.log('Full prompt being sent:', prompt);
console.log('Prompt length:', prompt.length);
console.time('Ollama Response Time');
```

#### Monitor All Requests
```bash
# Watch backend logs in real-time
tail -f ~/.pm2/logs/pmhelper-backend-out.log  # If using PM2
# Or just watch console where server is running
```

### 7. Recovery Steps

If generation fails or times out:

1. **Check Ollama is responding:**
   ```bash
   ollama list  # Should show models
   ```

2. **Restart Ollama:**
   ```bash
   killall ollama
   ollama serve
   ```

3. **Clear browser state:**
   - Open DevTools (F12)
   - Application tab → Local Storage → Clear

4. **Restart backend:**
   ```bash
   # Kill existing process (Ctrl+C)
   PORT=3001 node server-simple.js
   ```

5. **Try simpler content:**
   - Reduce PRD to essential sections
   - Keep engineering notes brief
   - Use "implementation" template (simplest)

### 8. Known Limitations

- **Timeout**: 5-minute hard limit on requests
- **No progress indication**: Can't see generation progress
- **Memory**: Large contexts can cause Ollama to slow down
- **Model size**: Mistral 7B is slower than smaller models

### 9. Recommended Settings for Demo

For reliable demos, use:
- Model: `llama3.2:1b` (fastest)
- Temperature: 0.3 (consistent)
- Keep PRDs under 1000 words
- Engineering notes under 200 words
- Test full flow before demo

### 10. Getting Help

1. **Check Logs:**
   - Browser console (F12)
   - Backend terminal output
   - Ollama logs: `~/.ollama/logs/`

2. **Test Components:**
   - Ollama only: `curl` test
   - Backend only: API endpoint test
   - Frontend: Check network tab

3. **Common Fixes:**
   - Restart Ollama
   - Use smaller model
   - Reduce prompt size
   - Increase timeout

### Emergency Demo Mode

If nothing works during a demo:
1. Use Chat tab to manually generate content
2. Copy-paste into specification sections
3. Explain it usually auto-generates
4. Show the architecture/flow diagram instead