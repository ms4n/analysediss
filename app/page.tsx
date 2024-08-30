'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  role: 'user' | 'assistant'
  content: string | Array<{type: string, text: string}>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7))
  }, [])

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const response = await axios.post('http://localhost:8000/chat', {
          session_id: sessionId,
          message: inputMessage
        });
  
        console.log('Server response:', response.data);
  
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'user', content: inputMessage },
          { role: 'assistant', content: response.data.response }
        ]);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Error response:', error.response.data);
          console.error('Status code:', error.response.status);
          console.error('Headers:', error.response.headers);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">AnalyseDiss Chat</h1>
        <Card className="mb-4">
          <ScrollArea className="h-[400px] w-full p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                <p className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}:</p>
                <p>{Array.isArray(message.content) 
                  ? message.content.map(item => item.text).join(' ') 
                  : message.content}
                </p>
              </div>
            ))}
          </ScrollArea>
        </Card>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button className='bg-blue-600 text-white' onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </main>
  )
}