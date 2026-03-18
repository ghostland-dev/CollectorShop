import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { Conversation } from '../../services/chat.service';
import { useTranslation } from 'react-i18next';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  getOtherUser: (conversation: Conversation) => { id: string; email: string; firstName?: string; lastName?: string } | null;
}

export function ConversationList({ conversations, currentConversationId, getOtherUser }: ConversationListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {t('chat.conversations')}
      </Typography>
      {conversations.length === 0 ? (
        <Alert severity="info">{t('chat.noConversations')}</Alert>
      ) : (
        <List>
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.messages?.[0];
            return (
              <ListItem
                key={conversation.id}
                button
                selected={conversation.id === currentConversationId}
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
  );
}
