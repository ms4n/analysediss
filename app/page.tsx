"use client";

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Copy, ChevronDown, ChevronUp, Send } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'user', content: inputMessage },
          { role: 'assistant', content: response.data.response }
        ]);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const hintQuestions = [
    "What is the total sales amount for each product category?",
    "What is the distribution of sales across different product categories in each region?",
    "How does the sales performance of electronics compare to furniture?",
  ];

  return (
    <main className="flex h-full mt-4 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">AnalyseDiss Chat</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hint: Example CSV File</CardTitle>
            <CardDescription>Use this information to ask questions about the data</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>File Information</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center justify-between mb-2">
                    <p>File path: app/services/example.csv</p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard("app/services/example.csv")}
                      title="Copy file path"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Sample Questions</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {hintQuestions.map((question, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="text-sm mr-2">{question}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(question)}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Chat History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh] w-full pr-4" ref={scrollAreaRef}>
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                  <p className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'Assistant'}:</p>
                  <p>{Array.isArray(message.content) 
                    ? message.content.map(item => item.text).join(' ') 
                    : message.content}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center items-center h-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow"
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading}
            size="icon"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </main>
  )
}