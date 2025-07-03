/**
 * WebSocket Service
 * Handles real-time features like live matching, notifications, and chat
 */

import { API_CONFIG } from '../config/api.config'
import { tokenManager } from '../utils/api-client'

type WebSocketEventHandler = (data: any) => void

interface WebSocketMessage {
  type: string
  data: any
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map()
  private isConnecting = false
  
  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }
    
    const token = tokenManager.getToken()
    if (!token) {
      console.error('No auth token available for WebSocket connection')
      return
    }
    
    this.isConnecting = true
    const wsUrl = `${API_CONFIG.WEBSOCKET.URL}?token=${token}`
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.emit('connected', null)
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
        this.emit('error', error)
      }
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnecting = false
        this.ws = null
        this.emit('disconnected', { code: event.code, reason: event.reason })
        
        // Attempt to reconnect
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.isConnecting = false
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.reconnectAttempts = 0
  }
  
  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }
    
    const message: WebSocketMessage = { type, data }
    this.ws.send(JSON.stringify(message))
  }
  
  /**
   * Subscribe to an event
   */
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    
    this.eventHandlers.get(event)!.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.off(event, handler)
    }
  }
  
  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }
  
  /**
   * Emit an event to all handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error)
        }
      })
    }
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        this.emit('notification', message.data)
        break
        
      case 'match':
        this.emit('match', message.data)
        break
        
      case 'message':
        this.emit('message', message.data)
        break
        
      case 'user_online':
        this.emit('user_online', message.data)
        break
        
      case 'user_offline':
        this.emit('user_offline', message.data)
        break
        
      case 'event_update':
        this.emit('event_update', message.data)
        break
        
      case 'points_update':
        this.emit('points_update', message.data)
        break
        
      default:
        this.emit(message.type, message.data)
    }
  }
  
  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= API_CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed', null)
      return
    }
    
    this.reconnectAttempts++
    const delay = API_CONFIG.WEBSOCKET.RECONNECT_INTERVAL * this.reconnectAttempts
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }
  
  /**
   * Join a room (for chat or live features)
   */
  joinRoom(roomId: string): void {
    this.send('join_room', { roomId })
  }
  
  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId })
  }
  
  /**
   * Send chat message
   */
  sendChatMessage(roomId: string, message: string): void {
    this.send('chat_message', { roomId, message })
  }
  
  /**
   * Update user status
   */
  updateStatus(status: 'online' | 'away' | 'busy'): void {
    this.send('update_status', { status })
  }
  
  /**
   * Subscribe to user updates
   */
  subscribeToUser(userId: string): void {
    this.send('subscribe_user', { userId })
  }
  
  /**
   * Unsubscribe from user updates
   */
  unsubscribeFromUser(userId: string): void {
    this.send('unsubscribe_user', { userId })
  }
  
  /**
   * Get connection state
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

// Auto-connect when authenticated
if (typeof window !== 'undefined') {
  window.addEventListener('auth:login', () => {
    websocketService.connect()
  })
  
  window.addEventListener('auth:logout', () => {
    websocketService.disconnect()
  })
}

export default websocketService