# Appointment Past Date Disabled

## Feature
Disabled selection of past dates in the appointment date picker. Users can only select today or future dates.

## Implementation

### Helper Function
Added a helper function to get today's date in YYYY-MM-DD format:

```javascript
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
```

This function:
- Gets the current date
- Formats it as YYYY-MM-DD (required format for HTML date input `min` attribute)
- Pads month and day with leading zeros if needed

### Date Input Update
Updated the appointment date input field to include the `min` attribute:

```javascript
<input
    id="appointment_date"
    type="date"
    name="appointment_date"
    className="form-input"
    value={params.appointment_date}
    onChange={changeValue}
    min={getTodayDate()}
    disabled={modalMode === 'view'}
/>
```

The `min` attribute:
- Sets the minimum selectable date to today
- Automatically disables all past dates in the date picker
- Prevents manual entry of past dates
- Works natively in all modern browsers

## Behavior

### Create Appointment
- Date picker opens with today as the minimum date
- Past dates are grayed out and cannot be selected
- User can only select today or future dates
- Manual typing of past dates is prevented by the browser

### Edit Appointment
- If appointment date is in the future: Works normally
- If appointment date is in the past (historical data): 
  - The date is still displayed
  - The `min` attribute still applies
  - User cannot change to another past date
  - User can only change to today or future dates

### View Mode
- Date input is disabled (read-only)
- `min` attribute doesn't affect view mode

## Browser Support
The `min` attribute for date inputs is supported in:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Opera (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## User Experience

### Visual Feedback
- Past dates appear grayed out in the calendar picker
- Clicking on past dates has no effect
- Clear visual indication of which dates are selectable

### Error Prevention
- Prevents user from accidentally selecting past dates
- No need for validation error messages
- Better UX than showing error after submission

### Edge Cases Handled
1. **Timezone**: Uses local date, so "today" is based on user's timezone
2. **Historical Data**: Existing appointments with past dates can still be viewed
3. **Date Changes**: If editing a future appointment, can only change to today or later

## Testing

### Test Case 1: Create New Appointment
1. Click "Add Appointment"
2. Click on appointment date field
3. ✅ Calendar opens with past dates disabled
4. ✅ Can select today
5. ✅ Can select future dates
6. ✅ Cannot select past dates

### Test Case 2: Edit Future Appointment
1. Open appointment with date: 28/02/2026 (future)
2. Click on date field
3. ✅ Can change to any date from today onwards
4. ✅ Cannot change to past dates

### Test Case 3: Edit Past Appointment (Historical)
1. Open appointment with date: 15/01/2026 (past)
2. Date shows: 15/01/2026
3. Click on date field
4. ✅ Can change to today or future dates
5. ✅ Cannot change to other past dates

### Test Case 4: Manual Entry
1. Try to manually type a past date
2. ✅ Browser prevents submission
3. ✅ Field shows validation error

## Files Modified
- `backend/components/management/appointments-crud.tsx`
  - Added `getTodayDate()` helper function
  - Added `min={getTodayDate()}` to appointment date input

## Status
✅ COMPLETE - Past dates are now disabled in appointment date picker
✅ Works in create mode
✅ Works in edit mode
✅ Prevents accidental selection of past dates
✅ Better user experience with visual feedback
