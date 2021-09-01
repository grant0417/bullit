import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { CookiesProvider } from "react-cookie";
import { HomePage } from "./pages/HomePage";
import { PostPage } from "./pages/PostPage";
import { UserPage } from "./pages/UserPage";
import { TagPage } from "./pages/TagPage";
import { SubmitPostPage } from "./pages/SubmitPostPage";
import { CreateUserPage } from "./pages/CreateUserPage";
import { LoginPage } from "./pages/LoginPage";
import { Header } from "./components/Header";
import QueryClient from "./QueryClient";

dayjs.extend(relativeTime);

function App() {
  return (
    <CookiesProvider>
      <QueryClientProvider client={QueryClient}>
        <Router>
          <div className="flex flex-col sm:gap-2 bg-usfEvergreen min-h-screen">
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
            <ReactQueryDevtools initialIsOpen />
          </div>
        </Router>
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default App;
