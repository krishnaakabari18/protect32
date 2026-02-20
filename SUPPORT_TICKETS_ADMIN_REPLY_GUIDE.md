# Support Tickets - Admin Reply Guide

## How to Reply to Tickets in Admin Side

The admin interface now supports full conversation threading on support tickets. Here's how to use it:

## Accessing Tickets

1. **Navigate to Support Tickets**
   - Click "Support Tickets" in the left sidebar
   - You'll see a list of all tickets with filters

2. **View Ticket Details**
   - Click the "Eye" icon (👁️) to view a ticket
   - Or click the "Edit" icon (✏️) to view and edit

## Viewing Conversation Thread

When you open a ticket in view or edit mode, you'll see:

### Ticket Information (Top Section)
- Patient Name and Phone
- Provider (if assigned)
- Subject
- Description
- Status

### Conversation Thread (Bottom Section)
- All replies in chronological order (oldest first)
- Each reply shows:
  - User avatar or initials
  - User name
  - User type badge (Patient/Provider/Admin)
  - Timestamp
  - Message content

## Replying to a Ticket

### Step 1: Open the Ticket
- Click the "Eye" icon to view the ticket
- The conversation thread will load automatically

### Step 2: Read the Conversation
- Scroll through existing replies
- Understand the context and issue

### Step 3: Type Your Reply
- Find the "Add Reply" section at the bottom
- Type your message in the text area
- Message can be multiple lines

### Step 4: Send Reply
- Click "Send Reply" button
- Reply will be added to the conversation
- Status automatically changes from "Open" to "In Progress" (if first reply)

## Reply Features

### Visual Indicators
- **Patient replies**: Blue background
- **Provider replies**: Green background
- **Admin replies**: Gray background (if admin user type)

### User Information
Each reply shows:
- Profile picture or initials
- Full name
- User type badge
- Exact date and time

### Auto-Status Update
- When first reply is added to an "Open" ticket
- Status automatically changes to "In Progress"
- Indicates active conversation

## Closed Tickets

### Cannot Reply to Closed Tickets
- If ticket status is "Closed"
- Reply input is disabled
- Yellow warning message shown:
  > "This ticket is closed. Change the status to 'Open' or 'In Progress' to continue the conversation."

### Reopening a Ticket
1. Click "Edit" icon on the ticket
2. Change Status dropdown from "Closed" to "Open" or "In Progress"
3. Click "Update"
4. Now you can add replies again

## Editing Ticket Details

While viewing the conversation, you can also:
- Change the assigned provider
- Update the status
- Modify subject or description (in edit mode)

## Best Practices

### 1. Timely Responses
- Reply to tickets promptly
- Patients are waiting for help

### 2. Clear Communication
- Be specific and helpful
- Provide step-by-step instructions if needed
- Ask clarifying questions

### 3. Status Management
- Keep status updated:
  - "Open" - New ticket, no response yet
  - "In Progress" - Active conversation
  - "Closed" - Issue resolved

### 4. Provider Assignment
- Assign relevant provider if needed
- Provider can also reply to the ticket

### 5. Close When Resolved
- Once issue is resolved, set status to "Closed"
- Add final reply explaining resolution
- Patient can see the conversation history

## Example Conversation Flow

```
┌─────────────────────────────────────────┐
│ Ticket #12345                           │
│ Subject: Cannot book appointment        │
│ Status: Open → In Progress → Closed     │
└─────────────────────────────────────────┘

👤 John Doe (Patient)
📅 20/02/2026 10:30 AM
"I'm trying to book an appointment but the 
system shows no available slots."

👨‍💼 Admin (You)
📅 20/02/2026 11:00 AM
"Thank you for reaching out. I'm checking 
the availability for you. Which provider 
would you like to see?"

👤 John Doe (Patient)
📅 20/02/2026 11:15 AM
"Dr. Smith please, any day next week."

👨‍💼 Admin (You)
📅 20/02/2026 11:30 AM
"I've opened up slots for Dr. Smith next 
week. You should now be able to book. 
Please try again and let me know if you 
still face issues."

👤 John Doe (Patient)
📅 20/02/2026 02:00 PM
"It works now! Booked for Wednesday. 
Thank you!"

👨‍💼 Admin (You)
📅 20/02/2026 02:15 PM
"Great! See you on Wednesday. Closing 
this ticket as resolved."

[Status changed to: Closed]
```

## Keyboard Shortcuts

- **Enter**: New line in message (Shift+Enter on some systems)
- **Tab**: Navigate between fields
- **Esc**: Close modal

## Mobile Responsive

The conversation thread is fully responsive:
- Works on tablets and phones
- Touch-friendly interface
- Scrollable conversation area

## Troubleshooting

### Replies Not Loading
- Check internet connection
- Refresh the page
- Ensure you're logged in

### Cannot Send Reply
- Check if ticket is closed
- Ensure message is not empty
- Check authentication token

### Status Not Updating
- Refresh the ticket list
- Status updates automatically on first reply

## API Endpoints Used

### Get Replies
```
GET /api/v1/support-tickets/:ticket_id/replies
```

### Send Reply
```
POST /api/v1/support-tickets/:ticket_id/replies
Body: { "message": "Your reply text" }
```

## Security

- All replies require authentication
- User ID automatically captured from auth token
- Cannot edit or delete others' replies
- Closed tickets protected from new replies

## Features Summary

✅ View full conversation thread
✅ Add replies to tickets
✅ See user type (Patient/Provider/Admin)
✅ Chronological ordering
✅ Auto-status update on first reply
✅ Closed ticket protection
✅ Profile pictures/initials
✅ Timestamps on all replies
✅ Scrollable conversation area
✅ Real-time reply sending
✅ Visual distinction between user types
✅ Mobile responsive

## Status
✅ COMPLETE - Admin can now reply to tickets
✅ Conversation thread visible
✅ All features working
✅ Ready to use!
