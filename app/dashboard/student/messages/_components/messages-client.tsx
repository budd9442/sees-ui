'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Send,
    Search,
    Paperclip,
    MoreVertical,
    Star,
    Archive,
    CheckCheck,
    MessageCircle,
    Users,
    User,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateFormatters';
import { sendStudentMessage } from '@/lib/actions/student-subactions';
import { toast } from 'sonner';

type MessageEntry = {
    id: string;
    senderId: string;
    receiverId: string;
    subject: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderRole: string;
    senderName: string;
    receiverRole: string;
    receiverName: string;
};

export default function MessagesClient({ initialMessages, currentUserId }: { initialMessages: MessageEntry[], currentUserId: string }) {
    const [messages, setMessages] = useState<MessageEntry[]>(initialMessages);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Group messages by conversation
    const conversations = messages.reduce((acc: any[], message) => {
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const existing = acc.find(c => c.userId === otherUserId);

        if (existing) {
            existing.messages.push(message);
            existing.lastMessage = message;
            existing.unreadCount = existing.messages.filter(
                (m: any) => m.receiverId === currentUserId && !m.isRead
            ).length;
        } else {
            acc.push({
                userId: otherUserId,
                user: {
                    firstName: message.senderId === currentUserId ? message.receiverName.split(' ')[0] : message.senderName.split(' ')[0],
                    lastName: message.senderId === currentUserId ? message.receiverName.split(' ')[1] || '' : message.senderName.split(' ')[1] || '',
                    role: message.senderId === currentUserId ? message.receiverRole : message.senderRole,
                },
                messages: [message],
                lastMessage: message,
                unreadCount: message.receiverId === currentUserId && !message.isRead ? 1 : 0,
            });
        }

        return acc;
    }, []);

    // Sort conversations by last message timestamp
    conversations.sort((a, b) => {
        const aTime = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bTime = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    const selectedConv = conversations.find(c => c.userId === selectedConversation);
    const filteredConversations = searchQuery
        ? conversations.filter(c =>
            `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : conversations;

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedConversation || isSending) return;
        setIsSending(true);

        try {
            const newMessage = await sendStudentMessage(selectedConversation, 'Direct Message', messageText);

            // Optimistically add message
            setMessages(prev => [{
                id: newMessage.message_id,
                senderId: currentUserId,
                receiverId: selectedConversation,
                subject: 'Direct Message',
                content: messageText,
                createdAt: new Date().toISOString(),
                isRead: false,
                senderRole: 'student',
                senderName: 'You',
                receiverRole: selectedConv?.user.role || 'staff',
                receiverName: `${selectedConv?.user.firstName} ${selectedConv?.user.lastName}`
            }, ...prev]);

            setMessageText('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'advisor': return 'bg-blue-500';
            case 'staff': return 'bg-green-500';
            case 'hod': return 'bg-purple-500';
            case 'admin': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Conversations List */}
            <Card className="w-96 flex flex-col">
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                        Communicate with your advisors and instructors
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    {/* Search */}
                    <div className="px-6 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="all" className="flex-1 flex flex-col">
                        <TabsList className="mx-6">
                            <TabsTrigger value="all" className="flex-1">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                All
                            </TabsTrigger>
                            <TabsTrigger value="advisors" className="flex-1">
                                <User className="h-4 w-4 mr-2" />
                                Advisors
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="flex-1">
                                <Users className="h-4 w-4 mr-2" />
                                Staff
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations.map((conv) => (
                                        <button
                                            key={conv.userId}
                                            onClick={() => setSelectedConversation(conv.userId)}
                                            className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation === conv.userId
                                                    ? 'bg-accent'
                                                    : 'hover:bg-accent/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar>
                                                    <AvatarFallback className={getRoleColor(conv.user.role)}>
                                                        {getInitials(conv.user.firstName, conv.user.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-sm">
                                                            {conv.user.firstName} {conv.user.lastName}
                                                        </p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {conv.lastMessage.createdAt ? formatRelativeTime(conv.lastMessage.createdAt) : 'Unknown time'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-muted-foreground truncate pr-2">
                                                            {conv.lastMessage.senderId === currentUserId && 'You: '}
                                                            {conv.lastMessage.content}
                                                        </p>
                                                        {conv.unreadCount > 0 && (
                                                            <Badge variant="default" className="ml-auto">
                                                                {conv.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {conv.user.role}
                                                        </Badge>
                                                        {conv.lastMessage.senderId === currentUserId && (
                                                            <CheckCheck className="h-3 w-3 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="advisors" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations
                                        .filter(c => c.user.role.toLowerCase() === 'advisor')
                                        .map((conv) => (
                                            <button
                                                key={conv.userId}
                                                onClick={() => setSelectedConversation(conv.userId)}
                                                className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation === conv.userId
                                                        ? 'bg-accent'
                                                        : 'hover:bg-accent/50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-blue-500">
                                                            {getInitials(conv.user.firstName, conv.user.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">
                                                            {conv.user.firstName} {conv.user.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="staff" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations
                                        .filter(c => c.user.role.toLowerCase() === 'staff')
                                        .map((conv) => (
                                            <button
                                                key={conv.userId}
                                                onClick={() => setSelectedConversation(conv.userId)}
                                                className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation === conv.userId
                                                        ? 'bg-accent'
                                                        : 'hover:bg-accent/50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-green-500">
                                                            {getInitials(conv.user.firstName, conv.user.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">
                                                            {conv.user.firstName} {conv.user.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Conversation View */}
            {selectedConv ? (
                <Card className="flex-1 flex flex-col">
                    {/* Header */}
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className={getRoleColor(selectedConv.user.role)}>
                                        {getInitials(selectedConv.user.firstName, selectedConv.user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">
                                        {selectedConv.user.firstName} {selectedConv.user.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {selectedConv.user.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Star className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Archive className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                            {[...selectedConv.messages]
                                .sort((a: any, b: any) => {
                                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                    return aTime - bTime;
                                })
                                .map((message: any) => {
                                    const isSent = message.senderId === currentUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${isSent
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <div className={`flex items-center gap-2 mt-1 ${isSent ? 'justify-end' : 'justify-start'
                                                    }`}>
                                                    <span className={`text-xs ${isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                        }`}>
                                                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }) : 'Unknown time'}
                                                    </span>
                                                    {isSent && (
                                                        <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Textarea
                                placeholder="Type your message..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                className="flex-1 min-h-[80px] resize-none"
                                disabled={isSending}
                            />
                            <Button onClick={sendMessage} disabled={!messageText.trim() || isSending}>
                                <Send className="h-4 w-4 mr-2" />
                                {isSending ? 'Sending...' : 'Send'}
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                        <h3 className="font-semibold">Select a conversation</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose a conversation from the list to start messaging
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
