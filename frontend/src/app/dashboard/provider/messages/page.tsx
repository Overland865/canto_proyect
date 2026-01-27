"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react"

// Mock Data
const contacts = [
    {
        id: "1",
        name: "Ana García",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        lastMessage: "Hola, ¿tienen disponibilidad para el próximo sábado?",
        time: "10:30 AM",
        unread: 2,
    },
    {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        lastMessage: "Gracias por la información, lo reviso y te aviso.",
        time: "Ayer",
        unread: 0,
    },
    {
        id: "3",
        name: "María López",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
        lastMessage: "¿El precio incluye el transporte?",
        time: "Lun",
        unread: 1,
    }
]

const messages = [
    {
        id: 1,
        senderId: "1", // User
        text: "Hola, buenas tardes.",
        time: "10:28 AM"
    },
    {
        id: 2,
        senderId: "1",
        text: "Vi su anuncio de Jardín Las Rosas y me interesa alquilarlo para una boda.",
        time: "10:29 AM"
    },
    {
        id: 3,
        senderId: "me", // Provider
        text: "¡Hola Ana! Claro que sí, con mucho gusto. ¿Para qué fecha estás buscando?",
        time: "10:30 AM"
    },
    {
        id: 4,
        senderId: "1",
        text: "Hola, ¿tienen disponibilidad para el próximo sábado?",
        time: "10:30 AM"
    }
]

export default function MessagesPage() {
    const [selectedContact, setSelectedContact] = useState(contacts[0])

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-white shadow-sm overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Mensajes</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar conversación..." className="pl-9 bg-slate-50" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {contacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${selectedContact.id === contact.id ? "bg-primary/5" : ""}`}
                            >
                                <Avatar>
                                    <AvatarImage src={contact.avatar} />
                                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm">{contact.name}</span>
                                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                                    </div>
                                    <p className={`text-xs truncate ${contact.unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                                        {contact.lastMessage}
                                    </p>
                                </div>
                                {contact.unread > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground transform translate-y-1">
                                        {contact.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {/* Chat Header */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-white">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={selectedContact.avatar} />
                            <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-sm">{selectedContact.name}</h3>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                                En línea
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Feed */}
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === "me"
                            return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-white border rounded-bl-none"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white border-t">
                    <div className="flex gap-2">
                        <Input placeholder="Escribe un mensaje..." className="flex-1" />
                        <Button size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
