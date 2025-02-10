/*GET /api/conversations
List all conversations for the logged-in user (both DMs and group chats).

GET /api/conversations/:conversationId
Get details for a specific conversation (participants, etc.).

POST /api/conversations
Create a new conversation.

For direct messages, this might involve specifying the recipient’s ID.
For group chats, you might create one when a group is created or allow users to start a new group conversation.
GET /api/conversations/:conversationId/messages
Retrieve messages in a conversation (optionally with pagination).

POST /api/conversations/:conversationId/messages
Send a new message in a conversation.

PUT /api/conversations/:conversationId/participants/:userId
Update conversation participant information (for example, to mark messages as read).

DELETE /api/conversations/:conversationId/messages/:messageId
Delete a specific message (if you support message deletion).

*/