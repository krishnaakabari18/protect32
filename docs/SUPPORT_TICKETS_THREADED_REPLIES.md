# Support Tickets - Threaded Replies Enhancement

## Overview
Enhanced the Customer Support Tickets module to support threaded conversation between Provider and Patient on the same ticket.

## Database Changes

### New Table: `ticket_replies`
**Fields**:
- `id` (UUID, Primary Key)
- `ticket_id` (UUID, FK to support_tickets)
- `user_id` (UUID, FK to users)
- `message` (TEXT, Required)
- `created_at` (TIMESTAMP, Auto)
- `updated_at` (TIMESTAMP, Auto with trigger)

**Indexes**:
- ticket_id
- user_id  
- created_at (ASC for chronological order)

**Sample Data**: 5 sample replies inserted

## Backend API

### New Model: `ticketReplyModel.js`
**Methods**:
- `create(replyData)` - Add new reply
- `findByTicketId(ticketId)` - Get all replies for a ticket (ordered chronologically)
- `findById(id)` - Get single reply
- `update(id, replyData)` - Update reply message
- `delete(id)` - Delete reply
- `getReplyCount(ticketId)` - Count replies on a ticket

**Features**:
- Joins with users table to get user details
- Returns user type (patient/provider) for each reply
- Formats dates as strings
- Orders replies chronologically (ASC)

### New Controller: `ticketReplyController.js`
**Endpoints**:
1. `createReply()` - POST /api/v1/support-tickets/:ticket_id/replies
   - Validates ticket exists
   - Checks if ticket is closed (prevents replies)
   - Auto-updates ticket status from "Open" to "In Progress" on first reply
   - Uses authenticated user ID

2. `getRepliesByTicket()` - GET /api/v1/support-tickets/:ticket_id/replies
   - Returns all replies for a ticket
   - Includes user details (name, type, profile picture)
   - Returns reply count

3. `updateReply()` - PUT /api/v1/support-tickets/replies/:id
   - Only reply owner can update
   - Updates message only

4. `deleteReply()` - DELETE /api/v1/support-tickets/replies/:id
   - Only reply owner can delete

**Business Logic**:
- Closed tickets cannot receive new replies
- First reply auto-changes status from "Open" to "In Progress"
- Users can only edit/delete their own replies
- Authentication required for all operations

### Routes Integration
Added to `supportTicketRoutes.js`:
```javascript
// Ticket Replies Routes
router.get('/:ticket_id/replies', TicketReplyController.getRepliesByTicket);
router.post('/:ticket_id/replies', TicketReplyController.createReply);
router.put('/replies/:id', TicketReplyController.updateReply);
router.delete('/replies/:id', TicketReplyController.deleteReply);
```

## API Endpoints

### Get Replies
**GET** `/api/v1/support-tickets/:ticket_id/replies`
- Returns all replies for a ticket
- Response includes user details and reply count
- Ordered chronologically (oldest first)

### Add Reply
**POST** `/api/v1/support-tickets/:ticket_id/replies`
- Body: `{ "message": "Reply text" }`
- Auto-detects user from auth token
- Returns 400 if ticket is closed
- Returns 404 if ticket not found

### Update Reply
**PUT** `/api/v1/support-tickets/replies/:id`
- Body: `{ "message": "Updated text" }`
- Only owner can update
- Returns 403 if not owner

### Delete Reply
**DELETE** `/api/v1/support-tickets/replies/:id`
- Only owner can delete
- Returns 403 if not owner

## Ticket Flow

### 1. Ticket Creation
- Patient creates ticket with subject and description
- Status: "Open"
- No replies yet

### 2. First Reply
- Provider or Patient adds first reply
- Status automatically changes: "Open" → "In Progress"
- Reply saved with user_id and timestamp

### 3. Conversation Thread
- Provider replies to patient
- Patient replies back
- Conversation continues on same ticket_id
- All replies visible in chronological order

### 4. Ticket Closure
- Admin/Provider sets status to "Closed"
- No further replies allowed
- API returns error: "Cannot reply to a closed ticket"
- Must reopen ticket to continue conversation

### 5. Ticket Reopen
- Change status from "Closed" to "Open" or "In Progress"
- Replies enabled again

## Frontend Integration (To Be Implemented)

### View Ticket Modal Enhancement
**Current**: Shows ticket details only
**Enhanced**: 
- Show ticket details at top
- Show conversation thread below
- Display each reply with:
  - User name and type (Patient/Provider)
  - Profile picture
  - Message text
  - Timestamp
  - Edit/Delete buttons (for own replies only)

### Reply Input
- Text area for new reply
- "Send Reply" button
- Disabled if ticket is closed
- Show message: "This ticket is closed. Reopen to continue conversation."

### Reply Display
```
┌─────────────────────────────────────┐
│ Ticket #12345                       │
│ Subject: Need help with appointment │
│ Status: In Progress                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👤 John Doe (Patient)               │
│ 📅 20/02/2026 10:30 AM              │
│                                     │
│ I need to reschedule my appointment │
│ for next week.                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👨‍⚕️ Dr. Smith (Provider)            │
│ 📅 20/02/2026 11:15 AM              │
│                                     │
│ Sure, what day works best for you?  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👤 John Doe (Patient)               │
│ 📅 20/02/2026 02:45 PM              │
│                                     │
│ Wednesday afternoon would be great. │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💬 Add Reply                        │
│ ┌─────────────────────────────────┐ │
│ │ Type your message here...       │ │
│ └─────────────────────────────────┘ │
│ [Send Reply]                        │
└─────────────────────────────────────┘
```

## Security Features

### Authentication
- All endpoints require valid auth token
- User ID extracted from token

### Authorization
- Users can only edit/delete their own replies
- Cannot reply to closed tickets
- Ticket owner validation

### Data Validation
- Message required for replies
- Ticket existence validation
- Reply ownership validation

## Status Management

### Auto-Status Update
- First reply changes "Open" → "In Progress"
- Indicates active conversation

### Manual Status Update
- Admin can change to any status
- "Closed" prevents new replies
- Must reopen to continue

## Error Handling

### Common Errors
1. **404 - Ticket Not Found**
   - Ticket ID doesn't exist

2. **400 - Cannot Reply to Closed Ticket**
   - Ticket status is "Closed"
   - Must reopen first

3. **403 - Forbidden**
   - Trying to edit/delete someone else's reply

4. **401 - Unauthorized**
   - No auth token or invalid token

## Testing Checklist

### Create Reply
- ✅ Patient can reply to their ticket
- ✅ Provider can reply to any ticket
- ✅ Reply saves with correct user_id
- ✅ Timestamp recorded correctly
- ✅ First reply changes status to "In Progress"

### View Replies
- ✅ All replies load for a ticket
- ✅ Replies ordered chronologically
- ✅ User details show correctly
- ✅ Reply count accurate

### Update Reply
- ✅ User can edit own reply
- ✅ Cannot edit others' replies (403)
- ✅ Message updates successfully

### Delete Reply
- ✅ User can delete own reply
- ✅ Cannot delete others' replies (403)
- ✅ Reply removed from database

### Closed Ticket
- ✅ Cannot add reply to closed ticket
- ✅ Error message shown
- ✅ Can view existing replies
- ✅ Can reopen and continue

## Files Created

### Backend
1. `api/database/create-ticket-replies-table.sql` - Database schema
2. `api/src/models/ticketReplyModel.js` - Data model
3. `api/src/controllers/ticketReplyController.js` - Business logic

### Modified Files
1. `api/src/routes/v1/supportTicketRoutes.js` - Added reply routes

## Database Setup
```bash
PGPASSWORD=dentist@345 psql -h localhost -U dentist -d dentist_newdb -f api/database/create-ticket-replies-table.sql
```

## Next Steps (Frontend)

1. **Update View Modal**
   - Add conversation thread section
   - Display all replies chronologically
   - Show user avatars and names

2. **Add Reply Input**
   - Text area for new message
   - Send button
   - Disable if closed

3. **Reply Actions**
   - Edit button (own replies only)
   - Delete button (own replies only)
   - Confirmation dialogs

4. **Real-time Updates** (Optional)
   - WebSocket for live updates
   - Notification on new reply

5. **UI Enhancements**
   - Different styling for patient vs provider replies
   - Read receipts
   - Typing indicators

## Status
✅ Database table created
✅ Backend model implemented
✅ Backend controller implemented
✅ API routes configured
✅ Sample data inserted
✅ Closed ticket validation
✅ Auto-status update on first reply
✅ User ownership validation
⏳ Frontend UI (pending implementation)
