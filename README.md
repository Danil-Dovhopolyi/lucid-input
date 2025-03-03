# Formula Input React Component

A dynamic and interactive formula input component built using **React** and **Zustand** for state management, designed to handle complex formula input, suggestions, and validation. The component supports autocomplete, editing tags, operand entry, and formula validation.

## Features

- **Formula Input**: Users can input and edit formulas using numbers, operators, and custom tags.
- **Autocomplete Suggestions**: As the user types, suggestions for tags are shown and can be selected using the keyboard or mouse.
- **Formula Validation**: The input is validated in real-time to ensure a correct structure before submitting.
- **Keyboard Navigation**: Users can navigate the suggestions list with arrow keys and select using `Enter`.
- **Result Calculation**: Formula results are automatically calculated and displayed when the formula is valid.
- **Error Handling**: Displays error messages if the formula is invalid or cannot be calculated.

## Technologies Used

- **React**: For building the user interface.
- **Zustand**: For managing the formula state.
- **React Query**: For fetching autocomplete suggestions from an API.
- **Tailwind CSS**: For styling the component.
- **TypeScript**: For static typing and better developer experience.

