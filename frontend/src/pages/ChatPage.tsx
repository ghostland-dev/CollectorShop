import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Container,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, Conversation } from '../services/chat.service';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
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
        {/* Liste des conversations */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              {t('chat.conversations')}
            </Typography>
            {conversationsData?.conversations.length === 0 ? (
              <Alert severity="info">{t('chat.noConversations')}</Alert>
            ) : (
              <List>
                {conversationsData?.conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const lastMessage = conversation.messages?.[0];
                  return (
                    <ListItem
                      key={conversation.id}
                      button
                      selected={conversation.id === conversationId}
                      onClick={() => navigate(`/chat/${conversation.id}`)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                      }}
                    >
                      <Avatar sx={{ mr: 2 }}>
                        {otherUser?.firstName?.[0] || otherUser?.email[0].toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={otherUser?.firstName ? `${otherUser.firstName} ${otherUser.lastName || ''}`.trim() : otherUser?.email}
                        secondary={
                          <Box>
                            {lastMessage && (
                              <Typography variant="body2" noWrap>
                                {lastMessage.content}
                              </Typography>
                            )}
                            {conversation.announcement && (
                              <Chip
                                label={conversation.announcement.title}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Zone de messages */}
        <Grid item xs={12} md={8}>
          {conversationId && currentConversation ? (
            <Paper sx={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
              {/* En-tête de la conversation */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {getOtherUser(currentConversation)?.firstName
                    ? `${getOtherUser(currentConversation)?.firstName} ${getOtherUser(currentConversation)?.lastName || ''}`.trim()
                    : getOtherUser(currentConversation)?.email}
                </Typography>
                {currentConversation.announcement && (
                  <Typography variant="body2" color="text.secondary">
                    {currentConversation.announcement.title} - {currentConversation.announcement.price}€
                  </Typography>
                )}
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messagesLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : messagesData?.messages.length === 0 ? (
                  <Alert severity="info">{t('chat.noMessages')}</Alert>
                ) : (
                  <List>
                    {messagesData?.messages.map((message) => {
                      const isOwnMessage = message.sender.id === user?.id;
                      return (
                        <ListItem
                          key={message.id}
                          sx={{
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isOwnMessage ? 'primary.main' : 'grey.200',
                              color: isOwnMessage ? 'white' : 'text.primary',
                            }}
                          >
                            {!isOwnMessage && (
                              <Typography variant="caption" display="block" mb={0.5}>
                                {message.sender.firstName || message.sender.email}
                              </Typography>
                            )}
                            <Typography variant="body1">{message.content}</Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ mt: 0.5, opacity: 0.7 }}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Box>

              {/* Zone de saisie */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder={t('chat.typeMessage')}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  >
                    {t('chat.send')}
                  </Button>
                </Box>
              </Box>
            </Paper>
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

