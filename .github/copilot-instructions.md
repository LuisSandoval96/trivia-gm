<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Trivia General Motors - Copilot Instructions

## Project Overview
This is a real-time multiplayer trivia application about General Motors history, built with Node.js, Express, and Socket.io. The application features:

- Kahoot-style trivia game with 15 questions about GM history (North America and Mexico)
- Real-time multiplayer functionality
- Admin dashboard for game management
- Winner receives a digital Hummer EV coupon
- Responsive design for mobile and desktop

## Architecture
- **Backend**: Node.js with Express and Socket.io for real-time communication
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Real-time Features**: Socket.io for live game updates, player management, and scoring

## Key Features
1. **Player Interface**: Join game, answer questions, view leaderboard, receive winner coupon
2. **Admin Panel**: Start/manage games, monitor players, view live statistics
3. **Real-time Updates**: Live player counts, answer distributions, leaderboards
4. **Responsive Design**: Works on desktop and mobile devices
5. **Winner System**: Digital coupon generation for Hummer EV prize

## File Structure
- `server.js`: Main server file with Socket.io logic and game state management
- `public/index.html`: Player interface
- `public/admin.html`: Administrator dashboard
- `public/css/style.css`: Player interface styling
- `public/css/admin.css`: Admin dashboard styling
- `public/js/game.js`: Player-side JavaScript logic
- `public/js/admin.js`: Admin-side JavaScript logic

## Coding Guidelines
- Use modern JavaScript (ES6+) features
- Maintain consistent naming conventions (camelCase for variables/functions)
- Follow Socket.io best practices for real-time communication
- Ensure responsive design for all screen sizes
- Use semantic HTML and accessible design patterns
- Implement error handling and user feedback
- Keep CSS organized with logical grouping and comments

## Game Flow
1. Players join by entering name and selecting avatar
2. Admin starts the game from admin panel
3. Questions are displayed with 30-second timer
4. Players select answers in real-time
5. Results and explanations are shown after each question
6. Final leaderboard determines winner
7. Winner receives digital Hummer EV coupon

## Styling Theme
- Color scheme: Blue gradients (#667eea, #764ba2, #3498db)
- Typography: Poppins font family
- Design: Modern, clean interface with cards and smooth animations
- Icons: Emojis for avatars and visual elements
- Effects: Backdrop blur, box shadows, gradient backgrounds
