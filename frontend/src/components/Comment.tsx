import { useMemo, useState } from 'react';
import { ReplyIcon } from '@heroicons/react/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserLine } from './UserLine';
import dayjs from 'dayjs';

export function Comment({ comment }: { comment: any }) {
  const [expanded, setExpanded] = useState(true);
  const timePosted = useMemo(() => dayjs(comment.createdAt).toString(), [comment.createdAt]);
  const timeAgo = useMemo(() => dayjs(comment.createdAt).fromNow(), [comment.createdAt]);

  return (
    <div className="flex flex-col">
      <div
        className={
          expanded
            ? 'px-2 py-0.5 border-l-2 border-t-2 border-r-2 mt-1 rounded-t bg-gray-50 flex flex-row items-center gap-1 sm:mx-0 mx-1'
            : 'px-2 py-0.5 border-2 mx-1 mb-1 mt-1 rounded bg-gray-50 flex flex-row items-center gap-1 sm:mx-0'
        }
      >
        <button
          className="text-sm w-5 text-gray-600"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? '[-]' : '[+]'}
        </button>
        <div className="text-gray-700">
          <UserLine username={comment.username} role={comment.role} />
        </div>
        {comment.time_posted && (
          <time
            dateTime={comment.time_posted}
            title={timePosted}
            className="text-gray-600 text-xs"
          >
            {timeAgo}
          </time>
        )}
      </div>
      {expanded && (
        <div className="px-2 py-0.5 border-2 mb-2 rounded-b bg-white sm:mx-0 mx-1">
          <ReactMarkdown
            className="prose"
            children={comment.body_text}
            remarkPlugins={[remarkGfm]}
            unwrapDisallowed={true}
            allowedElements={['p', 'blockquote', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img']}
          />
          {/* <div className="flex flex-row gap-1 items-center text-xs">
            <ReplyIcon className="h-3 w-3" />
            Reply
          </div> */}
        </div>
      )}
    </div>
  );
}
