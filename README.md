# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Backend & MongoDB (API server)

This project includes an Express/MongoDB backend under `backend/`. The React app
connects to MongoDB through this server at `http://localhost:5000/api`.

1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```
2. **Configure environment**
   - Copy or edit `backend/.env` and set `MONGO_URI` (e.g. `mongodb://127.0.0.1:27017/thefolio`).
   - Make sure MongoDB is running locally (or use a cloud connection string).
3. **Run the server**
   ```bash
   npm run dev    # uses nodemon
   ```
   The server will log `MongoDB Connected` and start on port 5000.

4. **API endpoints**
   - `POST /api/auth/register` – create a new user
   - `POST /api/auth/login` – obtain a JWT
   - `GET /api/posts` – list posts (example)

5. **React integration**
   - Frontend structure now mirrors the Phase‑2 diagram:
     ```
     src/
       api/           ← axios configuration
       context/       ← AuthContext for global auth state
       components/    ← shared UI pieces (Navbar, Footer, etc.)
       pages/         ← page-level components (HomePage, LoginPage ...)
     ```
   - Pages import components; `App.js` uses `<Navbar />` instead of `Header` and loads pages from `src/pages`.
   - `axios` instance handles base URL and token header (a lightweight stub exists under `node_modules/axios` so the code compiles even if the real package isn’t installed; run `npm install axios` when possible).
   - `AuthContext` wraps `<App />` to provide login/logout and token storage.
   - Protected routes can be guarded with `components/ProtectedRoute.js`.

6. **Misc**
   - `node` installation and `npm install` should now also install `axios`.
   - Feel free to add new pages (ProfilePage, PostPage, AdminPage) under `src/pages`.

With this setup React can create users and persist data in MongoDB through the
Express API. Modify or extend the routes/models as shown in the MERN tutorial
PDF you referenced.

