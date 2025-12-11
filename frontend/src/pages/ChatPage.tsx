import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, Conversation } from '../services/chat.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { ConversationList } from '../components/chat/ConversationList';
import { MessageArea } from '../components/chat/MessageArea';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuthStore();
  const { showError, showSuccess } = useNotifications();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showSuccess(t('chat.send') + ' ' + t('common.success'));
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showError(error.message || t('common.error'));
      } else {
        showError(t('common.error'));
      }
    },
  });

  const currentConversation = conversationsData?.conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData?.messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !currentConversation || !user) return;

    const receiverId =
      currentConversation.user1.id === user.id
        ? currentConversation.user2.id
        : currentConversation.user1.id;

    sendMessageMutation.mutate({
      receiverId,
      announcementId: currentConversation.announcement?.id,
      content: messageContent.trim(),
    });
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.user1.id === user.id ? conversation.user2 : conversation.user1;
  };

  if (conversationsLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        {t('chat.title')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <ConversationList
            conversations={conversationsData?.conversations || []}
            currentConversationId={conversationId}
            getOtherUser={getOtherUser}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          {conversationId && currentConversation ? (
            <MessageArea
              conversation={currentConversation}
              messages={messagesData?.messages || []}
              messagesLoading={messagesLoading}
              messageContent={messageContent}
              setMessageContent={setMessageContent}
              onSendMessage={handleSendMessage}
              isSending={sendMessageMutation.isPending}
              getOtherUser={getOtherUser}
              user={user}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {t('chat.noConversations')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sélectionnez une conversation pour commencer à discuter
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

