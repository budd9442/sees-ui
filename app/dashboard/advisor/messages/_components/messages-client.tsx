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
    Clock,
    CheckCheck,
    MessageCircle,
    User,
    AlertTriangle,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateFormatters';
import { useRouter } from 'next/navigation';
import { sendAdvisorMessage } from '@/lib/actions/advisor-subactions';

export default function MessagesClient({ initialData, currentUserId, currentUserName }: { initialData: any, currentUserId: string, currentUserName: string }) {
    const router = useRouter();
    const { students: myStudents, messages: initialMessages } = initialData;
    const [messages, setMessages] = useState(initialMessages);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const conversations = messages.reduce((acc: any[], message: any) => {
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const existing = acc.find((c: any) => c.userId === otherUserId);

        if (existing) {
            existing.messages.push(message);
            existing.lastMessage = message;
            existing.unreadCount = existing.messages.filter(
                (m: any) => m.receiverId === currentUserId && !m.isRead
            ).length;
        } else {
            const student = myStudents.find((s: any) => s.id === otherUserId);
            if (student) {
                acc.push({
                    userId: otherUserId,
                    student: student,
                    messages: [message],
                    lastMessage: message,
                    unreadCount: message.receiverId === currentUserId && !message.isRead ? 1 : 0,
                });
            }
        }

        return acc;
    }, []);

    conversations.sort((a: any, b: any) => {
        const aTime = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bTime = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    const selectedConv = conversations.find((c: any) => c.userId === selectedConversation);
    const filteredConversations = searchQuery
        ? conversations.filter((c: any) =>
            `${c.student.firstName} ${c.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : conversations;

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        const newMessage = {
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: 'advisor',
            receiverId: selectedConversation,
            receiverName: selectedConv?.student.firstName + ' ' + selectedConv?.student.lastName || 'Student',
            subject: 'Message from Advisor',
            content: messageText,
        };

        try {
            const _m = await sendAdvisorMessage(newMessage);
            setMessages((prev: any) => [...prev, _m.message]);
            setMessageText('');
            router.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const getStudentStatus = (student: any) => {
        if (student.currentGPA >= 3.7) return { status: 'Excellent', color: 'bg-green-500' };
        if (student.currentGPA >= 3.0) return { status: 'Good', color: 'bg-blue-500' };
        if (student.currentGPA >= 2.5) return { status: 'Satisfactory', color: 'bg-yellow-500' };
        return { status: 'At Risk', color: 'bg-red-500' };
    };

    const handleViewStudent = (studentId: string) => {
        router.push(`/dashboard/advisor/students/${studentId}`);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            <Card className="w-96 flex flex-col">
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Communicate with your advisees</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    <div className="px-6 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                    </div>
                    <Tabs defaultValue="all" className="flex-1 flex flex-col">
                        <TabsList className="mx-6">
                            <TabsTrigger value="all" className="flex-1"><MessageCircle className="h-4 w-4 mr-2" /> All</TabsTrigger>
                            <TabsTrigger value="at-risk" className="flex-1"><AlertTriangle className="h-4 w-4 mr-2" /> At Risk</TabsTrigger>
                            <TabsTrigger value="unread" className="flex-1"><Clock className="h-4 w-4 mr-2" /> Unread</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations.map((conv: any) => {
                                        const studentStatus = getStudentStatus(conv.student);
                                        return (
                                            <button key={conv.userId} onClick={() => setSelectedConversation(conv.userId)} className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation === conv.userId ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <Avatar><AvatarFallback className={studentStatus.color}>{getInitials(conv.student.firstName, conv.student.lastName)}</AvatarFallback></Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-medium text-sm">{conv.student.firstName} {conv.student.lastName}</p>
                                                            <span className="text-xs text-muted-foreground">{conv.lastMessage.createdAt ? formatRelativeTime(conv.lastMessage.createdAt) : 'Unknown time'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-muted-foreground truncate pr-2">{conv.lastMessage.senderId === currentUserId && 'You: '}{conv.lastMessage.content}</p>
                                                            {conv.unreadCount > 0 && <Badge variant="default" className="ml-auto">{conv.unreadCount}</Badge>}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">{conv.student.academicYear}</Badge>
                                                            <Badge variant="secondary" className="text-xs">{conv.student.specialization || conv.student.pathway}</Badge>
                                                            <Badge variant="outline" className="text-xs">GPA: {conv.student.currentGPA?.toFixed(2)}</Badge>
                                                            {conv.lastMessage.senderId === currentUserId && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="at-risk" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations.filter((c: any) => c.student.currentGPA < 2.5).map((conv: any) => (
                                        <button key={conv.userId} onClick={() => setSelectedConversation(conv.userId)} className={`w-full p-3 rounded-lg text-left transition-colors border-l-4 border-red-500 ${selectedConversation === conv.userId ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                                            <div className="flex items-start gap-3">
                                                <Avatar><AvatarFallback className="bg-red-500">{getInitials(conv.student.firstName, conv.student.lastName)}</AvatarFallback></Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1"><p className="font-medium text-sm">{conv.student.firstName} {conv.student.lastName}</p><AlertTriangle className="h-3 w-3 text-red-500" /></div>
                                                    <p className="text-sm text-muted-foreground truncate">GPA: {conv.student.currentGPA.toFixed(2)} • {conv.student.specialization || conv.student.pathway}</p>
                                                    <p className="text-xs text-red-600 mt-1">Last message: {conv.lastMessage.content.substring(0, 50)}...</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="unread" className="flex-1 mt-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 px-3">
                                    {filteredConversations.filter((c: any) => c.unreadCount > 0).map((conv: any) => (
                                        <button key={conv.userId} onClick={() => setSelectedConversation(conv.userId)} className={`w-full p-3 rounded-lg text-left transition-colors ${selectedConversation === conv.userId ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                                            <div className="flex items-start gap-3">
                                                <Avatar><AvatarFallback className="bg-blue-500">{getInitials(conv.student.firstName, conv.student.lastName)}</AvatarFallback></Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1"><p className="font-medium text-sm">{conv.student.firstName} {conv.student.lastName}</p><Badge variant="default">{conv.unreadCount}</Badge></div>
                                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage.content}</p>
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

            {selectedConv ? (
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar><AvatarFallback className={getStudentStatus(selectedConv.student).color}>{getInitials(selectedConv.student.firstName, selectedConv.student.lastName)}</AvatarFallback></Avatar>
                                <div>
                                    <h3 className="font-semibold">{selectedConv.student.firstName} {selectedConv.student.lastName}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{selectedConv.student.academicYear}</Badge>
                                        <Badge variant="secondary" className="text-xs">{selectedConv.student.specialization || selectedConv.student.pathway}</Badge>
                                        <Badge variant="outline" className="text-xs">GPA: {selectedConv.student.currentGPA.toFixed(2)}</Badge>
                                        <span className="text-xs text-muted-foreground">• Student ID: {selectedConv.student.studentId}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewStudent(selectedConv.student.id)}>
                                    <User className="h-4 w-4 mr-2" /> View Profile
                                </Button>
                                <Button variant="ghost" size="icon"><Star className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                            {(() => {
                                const msgs = [...selectedConv.messages];
                                msgs.sort((a: any, b: any) => {
                                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                    return aTime - bTime;
                                });
                                return msgs.map((message: any) => {
                                    const isSent = message.senderId === currentUserId;
                                    return (
                                        <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-lg p-3 ${isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p className="text-sm">{message.content}</p>
                                                <div className={`flex items-center gap-2 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
                                                    <span className={`text-xs ${isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
                                                    </span>
                                                    {isSent && <CheckCheck className="h-3 w-3 text-primary-foreground/70" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </ScrollArea>
                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                            <Textarea placeholder="Type your message to the student..." value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} className="flex-1 min-h-[80px] resize-none" />
                            <Button onClick={handleSendMessage} disabled={!messageText.trim()}><Send className="h-4 w-4 mr-2" /> Send</Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2"><MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" /><h3 className="font-semibold">Select a conversation</h3><p className="text-sm text-muted-foreground">Choose a student from the list to start messaging</p></div>
                </Card>
            )}
        </div>
    );
}
