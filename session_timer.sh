#!/bin/bash

# Session Timer for IDE Battle
# Usage: ./session_timer.sh start "Installing Cursor IDE"
# Usage: ./session_timer.sh end

SESSIONS_FILE="session_log.txt"

case "$1" in
    "start")
        if [ -z "$2" ]; then
            echo "Usage: ./session_timer.sh start \"Task description\""
            exit 1
        fi
        
        TASK="$2"
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        START_TIME=$(date +%s)
        
        echo "🚀 SESSION STARTED: $TIMESTAMP"
        echo "📋 Task: $TASK"
        echo ""
        echo "SESSION_START:$START_TIME:$TASK:$TIMESTAMP" >> $SESSIONS_FILE
        echo "⏰ Timer started! Run './session_timer.sh end' when finished."
        ;;
        
    "end")
        if [ ! -f "$SESSIONS_FILE" ]; then
            echo "❌ No active session found. Start one first!"
            exit 1
        fi
        
        LAST_SESSION=$(tail -n 1 $SESSIONS_FILE | grep "SESSION_START")
        if [ -z "$LAST_SESSION" ]; then
            echo "❌ No active session found."
            exit 1
        fi
        
        START_TIME=$(echo $LAST_SESSION | cut -d: -f2)
        TASK=$(echo $LAST_SESSION | cut -d: -f3)
        START_TIMESTAMP=$(echo $LAST_SESSION | cut -d: -f4-)
        
        END_TIME=$(date +%s)
        END_TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        DURATION=$((END_TIME - START_TIME))
        MINUTES=$((DURATION / 60))
        SECONDS=$((DURATION % 60))
        
        echo "🏁 SESSION ENDED: $END_TIMESTAMP"
        echo "📋 Task: $TASK"
        echo "⏱️  Duration: ${MINUTES}m ${SECONDS}s"
        echo ""
        
        # Prompt for session details
        echo "Rate this session (1-5):"
        read -p "💡 AI Assistance Quality: " ai_quality
        read -p "😤 Frustration Level: " frustration  
        read -p "🎯 Task Complexity: " complexity
        read -p "✅ Completed? (y/n): " completed
        
        # Log the complete session
        echo "SESSION_END:$END_TIME:$TASK:$END_TIMESTAMP:${MINUTES}m:$ai_quality:$frustration:$complexity:$completed" >> $SESSIONS_FILE
        echo ""
        echo "📊 Session logged! Check session_log.txt for full history."
        ;;
        
    "report")
        if [ ! -f "$SESSIONS_FILE" ]; then
            echo "📄 No sessions logged yet."
            exit 0
        fi
        
        echo "📊 SESSION REPORT"
        echo "=================="
        echo ""
        
        TOTAL_SESSIONS=$(grep "SESSION_END" $SESSIONS_FILE | wc -l)
        
        echo "🎯 Total Sessions: $TOTAL_SESSIONS"
        echo ""
        echo "📋 Recent Sessions:"
        echo "-------------------"
        
        grep "SESSION_END" $SESSIONS_FILE | tail -5 | while IFS=: read -r type end_time task timestamp duration ai frustration complexity completed; do
            echo "• $task - $duration (AI: $ai/5, Frustration: $frustration/5)"
        done
        ;;
        
    *)
        echo "🕐 Session Timer for IDE Battle"
        echo ""
        echo "Usage:"
        echo "  ./session_timer.sh start \"Task description\"  - Start timing a session"
        echo "  ./session_timer.sh end                        - End current session"
        echo "  ./session_timer.sh report                     - Show session summary"
        echo ""
        echo "Example:"
        echo "  ./session_timer.sh start \"Installing Cursor IDE\""
        echo "  # ... do your work ..."
        echo "  ./session_timer.sh end"
        ;;
esac
