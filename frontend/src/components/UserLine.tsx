import { BadgeCheckIcon } from '@heroicons/react/solid';
import { Link } from 'react-router-dom';

export function UserLine({
  username,
  role,
}: {
  username: string;
  role?: string;
}) {
  return (
    <Link to={`/u/${username}`} className="flex flex-row items-center">
      {username}
      {(role === 'admin' || role === 'mod' || role === 'approved') && (
        <div title={`This user is an approved poster`}>
          <BadgeCheckIcon className="h-4 w-4 text-blue-400" aria-label="Approved User" />
        </div>
      )}
    </Link>
  );
}
