import { BadgeCheckIcon } from '@heroicons/react/solid';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { PostLine } from '../components/PostLine';
import useStore from '../Store';
import { useState } from 'react';
import SortSelector from '../components/SortSelector';
import EditableDescription from '../components/EditableDescription';

export function UserPage() {
  const { name } = useParams<{ name: string }>();
  const currentUser = useStore((state) => state.username);
  const [sort, setSort] = useState('hot');

  const userQuery = useQuery(['user', name], async () => {
    const { data } = await axios.get(`/api/users/${name}`);
    return data;
  });

  const postsQuery = useQuery(['posts', name, { sort }], async () => {
    const { data } = await axios.get(`/api/posts?user=${name}&sort=${sort}`);
    return data;
  });

  return (
    <div className="sm:mx-2 bg-white sm:bg-transparent">
      {userQuery.data ? (
        <div className="sm:mx-auto max-w-4xl flex flex-col divide-y">
          <div className="sm:border sm:rounded bg-white py-2 px-4 flex flex-col gap-1">
            <div className="flex flex-row flex-wrap justify-between items-center gap-1">
              <div className="flex flex-row items-center gap-0.5">
                <div className="text-2xl pl-1">{userQuery.data.username}</div>
                {(userQuery.data.role === 'admin' ||
                  userQuery.data.role === 'mod' ||
                  userQuery.data.role === 'approved') && (
                  <div title="This user is an approved poster">
                    <BadgeCheckIcon className="h-6 w-6 text-blue-400" />
                  </div>
                )}
              </div>
              <div className="text-gray-800 text-sm pl-1">
                Joined:{' '}
                {dayjs(userQuery.data.time_created).format('D MMMM YYYY')}
              </div>
            </div>
            {currentUser === name ? (
              <EditableDescription description={userQuery.data.description} />
            ) : (
              <div className="text-gray-800 text-sm pl-1">
                {userQuery.data.description}
              </div>
            )}
            {/* <div className="text-gray-700 text-sm">
              {userQuery.data.role === "admin"
                ? "This user is an admin."
                : userQuery.data.role === "mod"
                ? "This user is a moderator."
                : userQuery.data.role === "approved"
                ? "This user is an approved user."
                : "This user is a normal user."}
            </div> */}
          </div>
          {postsQuery.data?.rows && (
            <>
              <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl w-full sm:py-1 py-2 px-2 my-0 sm:my-2">
                <SortSelector sort={sort} setSort={setSort} />
              </div>

              {postsQuery.data.rows.length > 0 ? (
                <div className="sm:border sm:rounded bg-white divide-y">
                  {postsQuery.data.rows.map((post: any) => (
                    <div className="py-0.5 px-2">
                      <PostLine key={post.id} post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sm:mx-auto max-w-4xl sm:border sm:rounded bg-white py-4 px-4 w-full">
                  {'No Posts Found'}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="sm:mx-auto max-w-4xl sm:border sm:rounded bg-white py-4 px-4 text-xl">
          {userQuery.error && <>User Not Found</>}
          {userQuery.isLoading && <>Loading...</>}
        </div>
      )}
    </div>
  );
}
