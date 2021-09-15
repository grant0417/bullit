import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CookiesProvider } from 'react-cookie';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { UserPage } from './pages/UserPage';
import { TagPage } from './pages/TagPage';
import { SubmitPostPage } from './pages/SubmitPostPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/Header';
import QueryClient from './QueryClient';

dayjs.extend(relativeTime);

function App() {
  return (
    <CookiesProvider>
      <QueryClientProvider client={QueryClient}>
        <Router>
          <div className="flex flex-col gap-2 bg-indigo-700 min-h-screen justify-between">
            <div className="flex flex-col sm:gap-2">
              <Header />
              <Switch>
                <Route path="/login">
                  <LoginPage />
                </Route>
                <Route path="/create-user">
                  <CreateUserPage />
                </Route>
                <Route path="/submit-post">
                  <SubmitPostPage />
                </Route>
                <Route path="/t/:tag">
                  <TagPage />
                </Route>
                <Route path="/u/:name">
                  <UserPage />
                </Route>
                <Route path="/p/:id">
                  <PostPage />
                </Route>
                <Route path="/">
                  <HomePage />
                </Route>
              </Switch>
            </div>
            <div>
              <p className="text-sm text-white text-center mb-3">
                Made by{' '}
                <a href="https://ggurvis.com" className="underline">
                  Grant
                </a>
                {' '}·{' '}
                Source code on{' '}
                <a href="https://github.com/grant0417/bullit" className="underline">
                  Github
                </a>
              </p>
            </div>
          </div>
          <ReactQueryDevtools initialIsOpen />
        </Router>
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default App;
