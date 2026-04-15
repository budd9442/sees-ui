'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  MessageCircle,
  CheckCheck,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/dateFormatters';
import { toast } from 'sonner';
import type { MessageCursor, MessageEntry } from '@/types/messaging';
import {
  getMyMessages,
  markMessagesRead,
  searchUsersForMessaging,
  sendDirectMessage,
} from '@/lib/actions/message-actions';
import { useMessagingRealtime } from '@/lib/hooks/use-messaging-realtime';
import { getPublicPusherConfig } from '@/lib/realtime/public-config';

type PeerInfo = { firstName: string; lastName: string; role: string };

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
}

function buildConversations(
  messages: MessageEntry[],
  peerExtras: Record<string, PeerInfo>,
  currentUserId: string
) {
  const map = new Map<
    string,
    {
      userId: string;
      firstName: string;
      lastName: string;
      role: string;
      messages: MessageEntry[];
    }
  >();

  for (const m of messages) {
    const otherUserId = m.senderId === currentUserId ? m.receiverId : m.senderId;
    const existing = map.get(otherUserId);
    const otherName = m.senderId === currentUserId ? m.receiverName : m.senderName;
    const otherRole = m.senderId === currentUserId ? m.receiverRole : m.senderRole;
    const fromMsg = splitName(otherName);
    const extra = peerExtras[otherUserId];
    const firstName = extra?.firstName ?? fromMsg.firstName;
    const lastName = extra?.lastName ?? fromMsg.lastName;
    const role = extra?.role ?? otherRole;

    if (existing) {
      existing.messages.push(m);
      if (extra) {
        existing.firstName = extra.firstName;
        existing.lastName = extra.lastName;
        existing.role = extra.role;
      }
    } else {
      map.set(otherUserId, {
        userId: otherUserId,
        firstName,
        lastName,
        role,
        messages: [m],
      });
    }
  }

  for (const [userId, extra] of Object.entries(peerExtras)) {
    if (!map.has(userId)) {
      map.set(userId, {
        userId,
        firstName: extra.firstName,
        lastName: extra.lastName,
        role: extra.role,
        messages: [],
      });
    }
  }

  const list = Array.from(map.values()).map((c) => {
    const sorted = [...c.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const lastMessage = sorted[sorted.length - 1] ?? null;
    const unreadCount = c.messages.filter(
      (m) => m.receiverId === currentUserId && m.senderId === c.userId && !m.isRead
    ).length;
    return { ...c, messages: sorted, lastMessage, unreadCount };
  });

  list.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return list;
}

export default function DirectMessagesClient({
  initialMessages,
  initialNextCursor,
  currentUserId,
  currentUserName,
  listDescription = 'Message anyone in the system. New messages appear instantly.',
}: {
  initialMessages: MessageEntry[];
  initialNextCursor: MessageCursor | null;
  currentUserId: string;
  currentUserName: string;
  listDescription?: string;
}) {
  const [messages, setMessages] = useState<MessageEntry[]>(initialMessages);
  const [nextCursor, setNextCursor] = useState<MessageCursor | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [peerExtras, setPeerExtras] = useState<Record<string, PeerInfo>>({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [convoFilter, setConvoFilter] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<
    { id: string; firstName: string; lastName: string; name: string; role: string }[]
  >([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const realtimeEnabled = !!getPublicPusherConfig();

  const onNewMessage = useCallback((payload: { message: MessageEntry }) => {
    const m = payload.message;
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [m, ...prev]));
  }, []);

  const onMessagesRead = useCallback((payload: { messageIds: string[] }) => {
    const ids = new Set(payload.messageIds);
    setMessages((prev) =>
      prev.map((m) => (ids.has(m.id) ? { ...m, isRead: true } : m))
    );
  }, []);

  useMessagingRealtime({
    userId: currentUserId,
    enabled: realtimeEnabled,
    onNewMessage,
    onMessagesRead,
  });

  useEffect(() => {
    if (!selectedConversation) return;
    void markMessagesRead({ otherUserId: selectedConversation }).then((r) => {
      if (r.updated > 0 && r.messageIds?.length) {
        const ids = new Set(r.messageIds);
        setMessages((prev) =>
          prev.map((m) => (ids.has(m.id) ? { ...m, isRead: true } : m))
        );
      }
    });
  }, [selectedConversation]);

  useEffect(() => {
    if (!newChatOpen) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await searchUsersForMessaging(q);
        if (res.rateLimited) {
          toast.error('Too many searches. Try again in a minute.');
          setUserResults([]);
        } else {
          setUserResults(res.users);
        }
      } catch {
        toast.error('User search failed');
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [userQuery, newChatOpen]);

  const conversations = useMemo(
    () => buildConversations(messages, peerExtras, currentUserId),
    [messages, peerExtras, currentUserId]
  );

  const filteredConversations = useMemo(() => {
    const term = convoFilter.trim().toLowerCase();
    const base = conversations;
    if (!term) return base;
    return base.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        (c.lastMessage?.content.toLowerCase().includes(term) ?? false)
    );
  }, [conversations, convoFilter]);

  const selectedConv = conversations.find((c) => c.userId === selectedConversation) ?? null;

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { messages: older, nextCursor: nc } = await getMyMessages({
        cursor: nextCursor,
        limit: 100,
      });
      setNextCursor(nc);
      setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const m of older) byId.set(m.id, m);
        return Array.from(byId.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch {
      toast.error('Could not load older messages');
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;
    setIsSending(true);
    try {
      const res = await sendDirectMessage({
        recipientId: selectedConversation,
        content: messageText.trim(),
      });
      setMessages((prev) => (prev.some((x) => x.id === res.message.id) ? prev : [res.message, ...prev]));
      setMessageText('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'advisor':
        return 'bg-blue-500';
      case 'staff':
        return 'bg-green-500';
      case 'hod':
        return 'bg-purple-500';
      case 'admin':
        return 'bg-red-500';
      case 'student':
        return 'bg-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const pickUserFromSearch = (u: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    setPeerExtras((prev) => ({
      ...prev,
      [u.id]: { firstName: u.firstName, lastName: u.lastName, role: u.role },
    }));
    setSelectedConversation(u.id);
    setNewChatOpen(false);
    setUserQuery('');
    setUserResults([]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="flex w-96 flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>{listDescription}</CardDescription>
          {!realtimeEnabled && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Realtime is disabled until NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER are set.
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="space-y-2 px-6 pb-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setNewChatOpen((o) => !o)}
            >
              <UserPlus className="h-4 w-4" />
              New conversation
            </Button>
            {newChatOpen && (
              <div className="space-y-2 rounded-md border p-2">
                <Input
                  placeholder="Search users by name or email…"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto text-sm">
                  {searchingUsers && (
                    <div className="flex items-center gap-2 p-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching…
                    </div>
                  )}
                  {!searchingUsers &&
                    userResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-accent"
                        onClick={() => pickUserFromSearch(u)}
                      >
                        <span className="font-medium">{u.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {u.role}
                        </Badge>
                      </button>
                    ))}
                </div>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter conversations…"
                value={convoFilter}
                onChange={(e) => setConvoFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {nextCursor && (
            <div className="px-6 pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  'Load older messages'
                )}
              </Button>
            </div>
          )}

          <Tabs defaultValue="all" className="flex flex-1 flex-col">
            <TabsList className="mx-6">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-2 flex-1">
              <ScrollArea className="h-[calc(100vh-22rem)]">
                <div className="space-y-1 px-3 pb-4">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.userId}
                      type="button"
                      onClick={() => setSelectedConversation(conv.userId)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        selectedConversation === conv.userId ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className={getRoleColor(conv.role)}>
                            {getInitials(conv.firstName, conv.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {conv.firstName} {conv.lastName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {conv.lastMessage
                                ? formatRelativeTime(conv.lastMessage.createdAt)
                                : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm text-muted-foreground">
                              {conv.lastMessage
                                ? `${conv.lastMessage.senderId === currentUserId ? 'You: ' : ''}${conv.lastMessage.content}`
                                : 'No messages yet'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="shrink-0">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {conv.role}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread" className="mt-2 flex-1">
              <ScrollArea className="h-[calc(100vh-22rem)]">
                <div className="space-y-1 px-3 pb-4">
                  {filteredConversations
                    .filter((c) => c.unreadCount > 0)
                    .map((conv) => (
                      <button
                        key={conv.userId}
                        type="button"
                        onClick={() => setSelectedConversation(conv.userId)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          selectedConversation === conv.userId ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className={getRoleColor(conv.role)}>
                              {getInitials(conv.firstName, conv.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {conv.firstName} {conv.lastName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {conv.lastMessage?.content}
                            </p>
                          </div>
                          <Badge variant="default">{conv.unreadCount}</Badge>
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
        <Card className="flex flex-1 flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className={getRoleColor(selectedConv.role)}>
                  {getInitials(selectedConv.firstName, selectedConv.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {selectedConv.firstName} {selectedConv.lastName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {selectedConv.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {selectedConv.messages.map((message) => {
                const isSent = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      {isSent && (
                        <span className="sr-only">
                          You, {currentUserName}
                        </span>
                      )}
                      {!isSent && (
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`mt-1 flex items-center gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <span
                          className={`text-xs ${
                            isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isSent && (
                          <span
                            className="inline-flex"
                            title={message.isRead ? 'Read' : 'Sent'}
                            aria-label={message.isRead ? 'Read' : 'Sent'}
                          >
                            <CheckCheck
                              className={`h-3 w-3 text-primary-foreground/80 ${message.isRead ? 'opacity-100' : 'opacity-40'}`}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                className="min-h-[80px] flex-1 resize-none"
                disabled={isSending}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!messageText.trim() || isSending}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-1 items-center justify-center">
          <div className="space-y-2 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose someone from the list or start a new conversation.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
