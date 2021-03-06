import { getDomain } from "tldjs";
import {
  ChatAlt2Icon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/solid";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Votes } from "./Votes";
import { UserLine } from "./UserLine";
import useStore from "../Store";
import axios from "axios";
import { useMutation } from "react-query";
import queryClient from "../QueryClient";
import ReactTooltip from "react-tooltip";

export function PostLine({ post }: { post: any }) {
  const role = useStore((state) => state.role);
  const username = useStore((state) => state.username);

  const approveMutation = useMutation(
    (id: string) => axios.post(`/api/posts/${id}/approve`),
    {
      onSettled: (_data, _error, id) => {
        queryClient.invalidateQueries(["posts", "list"]);
        queryClient.invalidateQueries(["posts", "details", id]);
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => axios.post(`/api/posts/${id}/delete`),
    {
      onSettled: (_data, _error, id) => {
        queryClient.invalidateQueries(["posts", "list"]);
        queryClient.invalidateQueries(["posts", "details", id]);
      },
    }
  );

  return (
    <div className="flex flex-row gap-2">
      <Votes id={post.id} votes={post.votes} currentVote={post.current_vote} />
      <div className="flex flex-col justify-center">
        <div className="flex flex-row flex-wrap gap-1 items-center">
          {(role === "admin" || role === "mod") && post.approved && (
            <ShieldCheckIcon className="h-5 w-5 text-green-400" aria-label="Approved Post" />
          )}
          {post.approved === false && (
            <>
              <p data-tip="This post is pending approval.">
                <ShieldExclamationIcon className="h-5 w-5 text-yellow-400" aria-label="Pending Approval Post" />
              </p>
              <ReactTooltip place="top" type="dark" effect="solid" />
            </>
          )}
          <div>
            {post.url_link ? (
              <a
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                href={post.url_link}
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
          {/* <PillTag tag="react" fontColor="blue" bgColor="#eeeeee" />
          <PillTag tag="typescript" fontColor="red" bgColor="#ffeecc" />
          <PillTag tag="c++" fontColor="gray" bgColor="#ddddff" /> */}

          {post.url_link && (
            <a
              href={`/site/${getDomain(post.url_link)}`}
              className="text-sm text-gray-700"
            >
              (<span className="underline">{getDomain(post.url_link)}</span>)
            </a>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-700 flex flex-row gap-0.5 items-baseline flex-wrap">
            <UserLine username={post.username} role={post.role} /> posted{" "}
            <time
              dateTime={post.time_posted}
              title={dayjs(post.time_posted).toString()}
            >
              {dayjs(post.time_posted).fromNow()}
            </time>
          </div>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <Link
            to={`/p/${post.id}`}
            className="flex flex-row items-center gap-1 group max-w-max"
          >
            <ChatAlt2Icon className="h-4 w-4 text-gray-700 group-hover:text-gray-500" aria-label="Comments" />
            <div className="text-sm text-gray-700 group-hover:text-gray-500">
              {post.comments} {post.comments === 1 ? 'comments': 'comments'} 
            </div>
          </Link>
          {post.approved === false && (role === "admin" || role === "mod") && (
            <>
              <div className="text-sm text-gray-700">??</div>
              <button
                onClick={() => {
                  approveMutation.mutate(post.id);
                }}
                className="text-sm text-gray-700 hover:text-gray-500"
              >
                Approve
              </button>
            </>
          )}
          {(username === post.username ||
            role === "admin" ||
            role === "mod") && (
            <>
              <div className="text-sm text-gray-700">??</div>
              <button
                onClick={() => {
                  deleteMutation.mutate(post.id);
                }}
                className="text-sm text-gray-700 hover:text-gray-500"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
