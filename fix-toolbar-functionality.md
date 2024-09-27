# Steps to Fix Toolbar Functionality

1. Verify Event Handlers
   - Ensure `onFormatClick` and `onColorClick` are properly passed to the Toolbar component
   - Check that these functions are defined and working correctly in the parent component

2. Implement Selection Preservation
   - Save the current selection before applying formatting
   - Restore the selection after applying formatting

3. Update Format Application Logic
   - Revise the `applyTextFormat` function to work with the current selection
   - Ensure it handles different format types correctly (inline styles vs block elements)

4. Handle Active States
   - Implement logic to accurately determine active formats
   - Update the `activeFormats` state based on the current selection

5. Optimize Performance
   - Use `useCallback` for event handlers in the parent component
   - Ensure Toolbar re-renders only when necessary

6. Add Console Logging
   - Temporarily add console logs to track function calls and state changes

7. Implement Error Handling
   - Add try-catch blocks to catch and handle any errors during format application

8. Test Edge Cases
   - Test functionality with different types of selections (single cursor, partial selection, multi-paragraph selection)

9. Browser Compatibility
   - Test the toolbar functionality across different browsers

10. Consider Using a Rich Text Editor Library
    - If issues persist, consider using a library like Draft.js or Quill.js
