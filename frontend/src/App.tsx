import React, { useMemo, useState } from "react";
import { getDomain } from "tldjs";
import {
  ChatAlt2Icon,
  BadgeCheckIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/solid";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

dayjs.extend(relativeTime);

type PostLine = {
  id: string;
  username: string;
  verifiedUser: boolean;
  title: string;
  url?: string;
  votes: number;
  timestamp: number;
};

function Votes({ votes, id }: { votes: number; id: string }) {
  return (
    <div className="flex flex-col text-center">
      <button className="text-yellow-500">
        <ChevronUpIcon className="h-6 w-6" />
      </button>
      <div>{votes}</div>
      <button className="text-blue-500">
        <ChevronDownIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

function UserLine({
  username,
  verified,
}: {
  username: string;
  verified?: boolean;
}) {
  return (
    <Link to={`/u/${username}`} className="flex flex-row items-center">
      {username}
      {verified && <BadgeCheckIcon className="h-4 w-4 text-blue-400" />}
    </Link>
  );
}

function CreateTagPage() {}

function PillTag({
  tag,
  fontColor,
  bgColor,
}: {
  tag: string;
  fontColor: string;
  bgColor: string;
}) {
  return (
    <Link
      to={`/t/${tag}`}
      className="rounded-full px-1 text-xs font-semibold"
      style={{ color: fontColor, backgroundColor: bgColor }}
    >
      {tag}
    </Link>
  );
}

function PostLine({ post }: { post: PostLine }) {
  return (
    <div className="flex flex-row gap-2">
      <Votes votes={post.votes} id={post.id} />
      <div className="flex flex-col justify-center">
        <div className="flex flex-row flex-wrap gap-1 items-center">
          {/* <ShieldExclamationIcon className="h-4 w-4 text-yellow-400" />
          <ShieldCheckIcon className="h-4 w-4 text-green-400" /> */}
          <div>
            {post.url ? (
              <a
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                href={post.url}
              >
                {post.title}
              </a>
            ) : (
              <Link
                to={`/p/${post.id}`}
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                {post.title}
              </Link>
            )}
          </div>
          <PillTag tag="react" fontColor="blue" bgColor="#eeeeee" />
          <PillTag tag="typescript" fontColor="red" bgColor="#ffeecc" />
          <PillTag tag="javascript" fontColor="green" bgColor="#ddffdd" />
          <PillTag tag="node" fontColor="purple" bgColor="#ddddff" />
          <PillTag tag="vue" fontColor="orange" bgColor="#ffdddd" />
          <PillTag tag="css" fontColor="teal" bgColor="#ddddff" />
          <PillTag tag="html" fontColor="pink" bgColor="#ffdddd" />
          <PillTag tag="python" fontColor="gray" bgColor="#ddddff" />
          <PillTag tag="rust" fontColor="gray" bgColor="#ddddff" />
          <PillTag tag="c" fontColor="gray" bgColor="#ddddff" />
          <PillTag tag="c++" fontColor="gray" bgColor="#ddddff" />

          {post.url && (
            <a
              href={`/site/${getDomain(post.url)}`}
              className="text-sm text-gray-700"
            >
              (<span className="underline">{getDomain(post.url)}</span>)
            </a>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-700 flex flex-row gap-0.5 items-baseline flex-wrap">
            <UserLine username={post.username} verified={post.verifiedUser} />{" "}
            posted {dayjs(post.timestamp).fromNow()}
          </div>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <Link
            to={`/p/${post.id}`}
            className="flex flex-row items-center gap-1 group max-w-max"
          >
            <ChatAlt2Icon className="h-4 w-4 text-gray-700 group-hover:text-gray-500" />
            <div className="text-sm text-gray-700 group-hover:text-gray-500">
              Comments
            </div>
          </Link>
          <div className="text-sm text-gray-700">·</div>
          <button className="text-sm text-gray-700 group-hover:text-gray-500">
            Approve
          </button>
          <div className="text-sm text-gray-700">·</div>
          <button className="text-sm text-gray-700 group-hover:text-gray-500">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const postsQuery = useQuery(["posts", "list"], async () => {
    const res = await fetch("/api/posts");
    return await res.json();
  });

  return (
    <div className="sm:mx-2">
      <div className="divide-y sm:border sm:rounded bg-white sm:mx-auto max-w-4xl">
        {postsQuery.data &&
          postsQuery.data.map((post: any) => (
            <div className="py-0.5 px-2">
              <PostLine key={post.id} post={post} />
            </div>
          ))}
      </div>
      {/* <div className="sm:border sm:rounded">
      <div>Create Account</div>
      <div>Log In</div>
    </div> */}
    </div>
  );
}

function Comment({ comment }: { comment: any }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col">
      <div
        className={
          expanded
            ? "px-2 py-0.5 border-l-2 border-t-2 border-r-2 mt-1 rounded-t bg-gray-50 flex flex-row items-center gap-1 sm:mx-0 mx-1"
            : "px-2 py-0.5 border-2 mx-1 mb-1 mt-1 rounded bg-gray-50 flex flex-row items-center gap-1 sm:mx-0"
        }
      >
        <button
          className="text-sm w-5 text-gray-600"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? "[-]" : "[+]"}
        </button>
        <div className="text-gray-700">
          <UserLine username={comment.username} verified />
        </div>
      </div>
      {expanded && (
        <div className="px-2 py-0.5 border-2 mb-2 rounded-b bg-white sm:mx-0 mx-1">
          <ReactMarkdown
            className="prose"
            children={comment.body}
            remarkPlugins={[remarkGfm]}
          />
        </div>
      )}
    </div>
  );
}

function PostPage() {
  let { id } = useParams<{ id: string }>();

  const postsQuery = useQuery(["posts", "details", id], async () => {
    const res = await fetch(`/api/posts/${id}`);
    return await res.json();
  });

  return (
    <div className="sm:mx-2">
      <div className="sm:mx-auto max-w-4xl">
        {postsQuery.data ? (
          <div className="flex flex-col gap-2 divide-y-2 sm:divide-y-0 bg-white sm:bg-transparent">
            <div className="flex flex-col  bg-white sm:rounded sm:border divide-y">
              <div className="flex flex-row items-center gap-2 px-2 py-0.5">
                <Votes votes={postsQuery.data.votes} id={postsQuery.data.id} />
                <div>
                  <div className="flex flex-row gap-1 items-baseline">
                    <div>
                      {postsQuery.data.url ? (
                        <a
                          className="text-2xl underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                          href={postsQuery.data.url}
                        >
                          {postsQuery.data.title}
                        </a>
                      ) : (
                        <div className="text-2xl">{postsQuery.data.title}</div>
                      )}
                    </div>
                    {postsQuery.data.url && (
                      <a
                        href={`/site/${getDomain(postsQuery.data.url)}`}
                        className="text-gray-700"
                      >
                        ({getDomain(postsQuery.data.url)})
                      </a>
                    )}
                  </div>

                  <div className="text-gray-700 flex flex-row gap-1">
                    <UserLine username={postsQuery.data.username} /> posted{" "}
                    {dayjs(postsQuery.data.timestamp).fromNow()}
                  </div>
                </div>
              </div>
              {postsQuery.data.body && (
                <div className="px-3 py-2">
                  <ReactMarkdown
                    className="prose"
                    children={postsQuery.data.body}
                    remarkPlugins={[remarkGfm]}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col px-2 gap-1 py-1 sm:rounded sm:border bg-white">
              <div>New Comment</div>
              <textarea className="border-2 rounded p-1" />
              <button className="place-self-end border rounded px-1 bg-gray-50 hover:bg-gray-200">
                Post
              </button>
            </div>
            <div className="">
              {postsQuery.data.comments.map((comment: any) => (
                <Comment comment={comment} />
              ))}
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

function UserPage() {
  let { name } = useParams<{ name: string }>();

  const postsQuery = useQuery(["user", name], async () => {
    const res = await fetch(`/api/users/${name}`);
    return await res.json();
  });

  return (
    <div className="sm:mx-2">
      {postsQuery.data && (
        <div className="sm:mx-auto max-w-4xl flex flex-col gap-2">
          <div className="sm:border sm:rounded bg-white  py-2 px-4">
            <div className="flex flex-row items-center gap-0.5">
              <div className="text-2xl">{postsQuery.data.name}</div>
              {postsQuery.data.verified && (
                <BadgeCheckIcon className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div className="text-gray-700">
              Graduation Semester: {postsQuery.data.graduationSemester}
            </div>
            <div className="text-gray-700">
              Joined: {postsQuery.data.joined}
            </div>
            <div className="text-gray-700">{postsQuery.data.description}</div>
          </div>
          <div className="sm:border sm:rounded bg-white  py-2 px-4">
            {postsQuery.data.posts.map((post: any) => (
              <div className="py-0.5 px-2">
                <PostLine key={post.id} post={post} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagPage() {
  let { tag } = useParams<{ tag: string }>();

  const postsQuery = useQuery(["posts", "list"], async () => {
    const res = await fetch("/api/posts");
    return await res.json();
  });

  return (
    <div className="sm:mx-2 bg-white sm:bg-transparent">
      <div className="sm:mx-auto max-w-4xl flex flex-col gap-2">
        <div className="divide-y sm:border sm:rounded bg-white p-3 text-xl">
          <span className="font-bold">Tag:</span> {tag}
        </div>
        <div className="divide-y sm:border sm:rounded bg-white ">
          {postsQuery.data &&
            postsQuery.data.map((post: any) => (
              <div className="py-0.5 px-2">
                <PostLine key={post.id} post={post} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SubmitPostPage() {
  return (
    <div className="sm:mx-2">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl py-2 px-4">
        <div className="text-2xl">New Post</div>
        <form>
          <div className="flex flex-col gap-1">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input id="title" name="title" className="border-2 rounded p-1" />
            </div>
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                Url
              </label>
              <input id="url" name="url" className="border-2 rounded p-1" />
            </div>
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700"
              >
                Text
              </label>
              <textarea
                id="body"
                name="body"
                className="border-2 rounded p-1"
              />
            </div>

            <input
              type="submit"
              value="Submit"
              className="place-self-end border rounded px-1 bg-gray-50 hover:bg-gray-200"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col sm:gap-2 bg-usfEvergreen min-h-screen">
          <div className="h-10 bg-usfGreen shadow flex justify-center items-center">
            <div className="max-w-4xl flex flex-row flex-1 justify-between items-center mx-2">
              <Link to="/" className="text-white font-bold text-2xl">
                {"[BULLit]"}
              </Link>
              <div className="flex flex-row">
                <button
                  className="text-white"
                  onClick={() => {
                    fetch("/api/login", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        username: "john",
                        password: "secret",
                      }),
                    });
                  }}
                >
                  Login
                </button>
                <div className="text-white">-</div>
                <button
                  className="text-white"
                  onClick={() => {
                    fetch("/api/logout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        username: "john",
                        password: "secret",
                      }),
                    });
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <Switch>
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
  );
}

export default App;
