import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import useStore from "../Store"

export function LoginPage() {
  const history = useHistory();
  const setUser = useStore((state: any) => state.setUsername);
  const setRole = useStore((state: any) => state.setRole);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutataion = useMutation(
    async () => {
      const res = await axios.post("/api/login", {
        username,
        password,
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        setUser(data.username);
        setRole(data.role);
        history.push("/");
      },
    }
  );

  return (
    <div className="sm:mx-2">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl py-2 px-4">
        <div className="text-2xl">New User</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            console.log(username, password);
            loginMutataion.mutate();
          }}
        >
          <div className="flex flex-col gap-1">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-2 rounded p-1" />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 rounded p-1" />
            </div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
