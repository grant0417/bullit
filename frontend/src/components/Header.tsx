import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useStore from "../Store";
import axios from "axios";

export function Header() {
  const setRole = useStore(state => state.setRole);
  const setUsername = useStore(state => state.setUsername);
  const username = useStore(state => state.username);

  return (
    <div className="h-10 bg-blue-900 shadow flex justify-center items-center">
      <div className="max-w-4xl flex flex-row flex-1 justify-between items-center mx-2">
        <Link to="/" className="text-white font-bold text-2xl">
          {"[bullit]"}
        </Link>
        <div className="flex flex-row gap-2">
          {username ? (
            <>
              <Link to={`/u/${username}`} className="text-white font-bold">{username}</Link>
              <Link to="/submit-post" className="text-white font-bold">
                Submit Post
              </Link>
              <button
                className="text-white font-bold"
                onClick={() => {
                  axios.post("/api/logout").then(() => {
                    setUsername(null);
                    setRole(null);
                  });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/create-user" className="text-white font-bold">
                Create Account
              </Link>
              <Link to="/login" className="text-white font-bold">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
