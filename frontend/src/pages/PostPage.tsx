import { getDomain } from 'tldjs';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Votes } from '../components/Votes';
import { UserLine } from '../components/UserLine';
import { Comment } from '../components/Comment';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import axios from 'axios';
import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import useStore from '../Store';

export function PostPage() {
  let { id } = useParams<{ id: string }>();

  const username = useStore((state) => state.username);

  const postsQuery = useQuery(['posts', 'details', id], async () => {
    const res = await fetch(`/api/posts/${id}`);
    return await res.json();
  });

  const commentsQuery = useQuery(['posts', 'comments', id], async () => {
    const res = await fetch(`/api/posts/${id}/comments`);
    return await res.json();
  });

  return (
    <div className="sm:mx-2">
      <div className="sm:mx-auto max-w-4xl">
        {postsQuery.data ? (
          <div className="flex flex-col gap-2 divide-y-2 sm:divide-y-0 bg-white sm:bg-transparent">
            <div className="flex flex-col  bg-white sm:rounded sm:border divide-y-2">
              <div className="flex flex-row items-center gap-2 px-2 py-0.5">
                <Votes
                  id={postsQuery.data.id}
                  votes={postsQuery.data.votes}
                  currentVote={postsQuery.data.current_vote}
                />
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
                    <UserLine
                      username={postsQuery.data.username}
                      role={postsQuery.data.role}
                    />{' '}
                    posted{' '}
                    <time
                      dateTime={postsQuery.data.time_posted}
                      title={dayjs(postsQuery.data.time_posted).toString()}
                    >
                      {dayjs(postsQuery.data.time_posted).fromNow()}
                    </time>
                  </div>
                </div>
              </div>
              {postsQuery.data.body_text && (
                <div className="px-3 py-2">
                  <ReactMarkdown
                    className="prose"
                    children={postsQuery.data.body_text}
                    remarkPlugins={[remarkGfm]}
                  />
                </div>
              )}
            </div>
            {username && (
              <Formik
                initialValues={{
                  newComment: '',
                }}
                validate={(values) => {
                  const errors: any = {};
                  if (!values.newComment) {
                    errors.newComment = 'Required';
                  }
                  return errors;
                }}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  axios
                    .post(`/api/posts/${id}/comments`, {
                      body: values.newComment,
                    })
                    .then(async () => {
                      values.newComment = '';
                      commentsQuery.refetch();
                      setSubmitting(false);
                    })
                    .catch(async () => {
                      setErrors({
                        newComment: 'Failed to post comment',
                      });
                      setSubmitting(false);
                    });
                }}
              >
                {({ isSubmitting, errors }) => (
                  <Form className="flex flex-col px-2 pt-1 pb-2 sm:rounded sm:border bg-white">
                    <label
                      htmlFor="newComment"
                      className="mb-0.5 flex flex-row items-center gap-1 text-gray-800"
                    >
                      {'New Comment'}
                      <div
                        title={`Comments support Markdown syntax with the following elements:\n${[
                          'p',
                          'blockquote',
                          'ul',
                          'ol',
                          'li',
                          'strong',
                          'em',
                          'a',
                          'img',
                        ].join('\n')}`}
                      >
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                      </div>
                    </label>
                    <Field
                      name="newComment"
                      as="textarea"
                      className={
                        errors.newComment
                          ? 'border-2 rounded p-1 ring-2 ring-red-600'
                          : 'border-2 rounded p-1'
                      }
                    />
                    <div className="flex flex-row-reverse justify-between w-full">
                      <button
                        type="submit"
                        className="mt-1.5 border rounded px-1 bg-gray-50 hover:bg-gray-200 disabled:hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={isSubmitting}
                      >
                        Post
                      </button>
                      <ErrorMessage
                        name="newComment"
                        component="div"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            )}
            {commentsQuery.data && (
              <div>
                {commentsQuery.data.map((comment: any) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white sm:rounded sm:border p-4">
            {postsQuery.isLoading && <div>Loading...</div>}
            {postsQuery.isError && <div>Post Not Found</div>}
          </div>
        )}
      </div>
    </div>
  );
}
