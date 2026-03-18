import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { Conversation, Message } from '../../services/chat.service';
import { useTranslation } from 'react-i18next';

interface MessageAreaProps {
  conversation: Conversation;
  messages: Message[];
  messagesLoading: boolean;
  messageContent: string;
  setMessageContent: (content: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
  getOtherUser: (conversation: Conversation) => { id: string; email: string; firstName?: string; lastName?: string } | null;
  user: { id: string } | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageArea({
  conversation,
  messages,
  messagesLoading,
  messageContent,
  setMessageContent,
  onSendMessage,
  isSending,
  getOtherUser,
  user,
  messagesEndRef,
}: MessageAreaProps) {
  const { t } = useTranslation();
  const otherUser = getOtherUser(conversation);

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          {otherUser?.firstName
            ? `${otherUser.firstName} ${otherUser.lastName || ''}`.trim()
            : otherUser?.email}
        </Typography>
        {conversation.announcement && (
          <Typography variant="body2" color="text.secondary">
            {conversation.announcement.title} - {conversation.announcement.price}€
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messagesLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Alert severity="info">{t('chat.noMessages')}</Alert>
        ) : (
          <List>
            {messages.map((message) => {
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
                onSendMessage();
              }
            }}
            disabled={isSending}
          />
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={onSendMessage}
            disabled={!messageContent.trim() || isSending}
          >
            {t('chat.send')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
