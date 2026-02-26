# Provider Weekly Time Slots Feature

## Overview
Added a weekly time slot management feature to the Providers form, allowing providers to set their available days and times for appointments.

## Features

### 1. Weekly Schedule UI
- Checkbox for each day of the week (Monday - Sunday)
- Time pickers for start and end times (24-hour format)
- Visual preview of formatted availability
- Clean, organized layout in the provider form

### 2. Smart Formatting
The system automatically formats time slots for display:
- **Input**: Monday 09:00-17:00, Tuesday 09:00-17:00, Wednesday 09:00-17:00
- **Output**: "Mon-Wed: 9am-5pm"

- **Input**: Monday 08:00-17:00, Friday 08:00-17:00
- **Output**: "Mon: 8am-5pm, Fri: 8am-5pm"

### 3. Time Format Conversion
- Backend stores in 24-hour format (09:00, 17:00)
- Frontend displays in 12-hour format (9am, 5pm)
- Automatically groups consecutive days with same hours

### 4. Data Storage
The system stores time slots in two formats:
1. **availability** field: Human-readable string (e.g., "Mon-Fri: 8am-5pm")
2. **time_slots** field: JSON object with detailed schedule

```json
{
  "monday": { "enabled": true, "start": "08:00", "end": "17:00" },
  "tuesday": { "enabled": true, "start": "08:00", "end": "17:00" },
  "wednesday": { "enabled": false, "start": "09:00", "end": "17:00" },
  ...
}
```

## How to Use

### Adding Time Slots (Create Provider)
1. Go to `/management/providers`
2. Click "Add Provider"
3. Fill in provider details
4. Scroll to "Weekly Availability" section
5. Check the days the provider is available
6. Set start and end times for each enabled day
7. See live preview below the time slots
8. Click "Add" to save

### Editing Time Slots (Edit Provider)
1. Click the edit button on any provider
2. Scroll to "Weekly Availability" section
3. Existing schedule will be loaded automatically
4. Modify days and times as needed
5. Preview updates in real-time
6. Click "Update" to save changes

### Viewing Time Slots
1. Click the view button on any provider
2. Availability is shown in the "Availability" field
3. Displays in formatted string (e.g., "Mon-Fri: 9am-5pm")

## Frontend Display
The formatted availability string can be used on the patient-facing frontend to show:
- Provider cards with availability
- Booking pages with available time slots
- Search filters by availability

Example from your screenshot:
```
Dr. Vikram Singh
Prosthodontics
Mon-Fri: 8am-5pm
```

## Technical Details

### Files Modified
- `backend/components/management/providers-crud.tsx`

### New Functions
1. `handleTimeSlotChange(day, field, value)` - Updates individual time slot
2. `formatTimeSlots(timeSlots)` - Converts JSON to readable string
3. `parseTimeSlots(availabilityStr)` - Converts string back to JSON

### TypeScript Interfaces
```typescript
interface TimeSlot {
    enabled: boolean;
    start: string;  // 24-hour format "HH:mm"
    end: string;    // 24-hour format "HH:mm"
}

interface TimeSlots {
    monday: TimeSlot;
    tuesday: TimeSlot;
    wednesday: TimeSlot;
    thursday: TimeSlot;
    friday: TimeSlot;
    saturday: TimeSlot;
    sunday: TimeSlot;
    [key: string]: TimeSlot;
}
```

## Example Use Cases

### Case 1: Standard Business Hours
- Monday-Friday: 9am-5pm
- Result: "Mon-Fri: 9am-5pm"

### Case 2: Extended Hours
- Monday-Thursday: 8am-6pm
- Friday: 8am-2pm
- Result: "Mon-Thu: 8am-6pm, Fri: 8am-2pm"

### Case 3: Weekend Availability
- Monday-Friday: 9am-5pm
- Saturday: 10am-2pm
- Result: "Mon-Fri: 9am-5pm, Sat: 10am-2pm"

### Case 4: Split Schedule
- Monday: 9am-5pm
- Wednesday: 9am-5pm
- Friday: 9am-5pm
- Result: "Mon: 9am-5pm, Wed: 9am-5pm, Fri: 9am-5pm"

## Backend Integration

The provider form sends time slots to the API in two formats:

```javascript
formData.append('availability', 'Mon-Fri: 9am-5pm');  // For display
formData.append('time_slots', JSON.stringify({        // For processing
    monday: { enabled: true, start: '09:00', end: '17:00' },
    // ... other days
}));
```

## Future Enhancements

Possible improvements:
1. Break times (lunch breaks)
2. Multiple time slots per day
3. Special hours for holidays
4. Recurring exceptions
5. Appointment duration settings
6. Buffer time between appointments

## Testing

Test the feature by:
1. Creating a new provider with various schedules
2. Editing existing providers
3. Verifying the preview matches your selection
4. Checking the database stores both formats
5. Viewing providers to see formatted availability
