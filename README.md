# 🖼️ Simple image viewer 

As part of a frontend developer role assignment I was asked to build a basic image viewer that allows users to upload and manipulate images.

🚨 <strong>See individual `README` files for [client](./client/README.md) and [server](./server/README.md) for more information</strong> 🚨

# 🔍 Requirements

### Image upload and display
- Users should be able to upload an image (JPG or PNG format).
- The uploaded image should be displayed in the UI.
- The uploaded image should be stored in the BE either on the local filesystem or some bucket alternative so it can be retrieved.
  I chose to store it on the local filesystem.

### Image manipulation
Users should be able to apply basic manipulations to the image, such as:
- Rotate the image (90 degrees at a time).
- Scale the image (zoom in/out).
- Reset the image to its original state.
#### ✨ Bonus points
- Add Drag and drop capabilities in the image upload component.
- Implement additional image manipulation features, such as flipping the image
  (horizontally/vertically).
- Add undo/redo functionality for applied transformations.
- Add a feature to draw on top of the image

# ⚙️ Tech stack
- Frontend: React (Hooks)
- Backend: Node
- State Management: React's useState/useReducer (or a light state management library)
- Canvas API (Bonus): HTML5 Canvas (2D) or WebGL (3D)
- Code clarity

# 🧑‍🏫 Evaluation criteria
- Code Clarity: Readable, maintainable code with logical structure.
- State Management: Effective use of state to handle image manipulations.
- User Experience: A simple, intuitive, and responsive interface.
- Bonus: Implementation of advanced image features or Canvas-based manipulation (2D or
  3D).
