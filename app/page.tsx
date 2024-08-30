'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

type Message = {
  role: 'user' | 'assistant'
  content: string | Array<{type: string, text: string}>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7))
  }, [])

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      setIsLoading(true)
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
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
      } finally {
        setIsLoading(false)
        scrollToBottom()
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  return (
    <main className="flex h-full mt-4 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center">AnalyseDiss Chat</h1>
        <Card className="mb-4">
          <ScrollArea className="h-[50vh] w-full p-2 sm:p-3 md:p-4" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                <p className="font-bold text-sm sm:text-base">{message.role === 'user' ? 'You' : 'Assistant'}:</p>
                <p className="text-sm sm:text-base">{Array.isArray(message.content) 
                  ? message.content.map(item => item.text).join(' ') 
                  : message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center h-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </ScrollArea>
        </Card>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="text-sm sm:text-base"
          />
          <Button 
            className='bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base' 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </main>
  )
}