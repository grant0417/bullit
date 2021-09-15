import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import useStore from '../Store';
import { ErrorMessage, Formik } from 'formik';

export function LoginPage() {
  const history = useHistory();
  const setUser = useStore((state: any) => state.setUsername);
  const setRole = useStore((state: any) => state.setRole);

  const loginMutataion = useMutation(
    async ({ username, password }: { username: string; password: string }) => {
      const res = await axios.post('/api/login', {
        username,
        password,
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        setUser(data.username);
        setRole(data.role);
        history.push('/');
      },
    }
  );

  return (
    <div className="sm:mx-2">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl py-2 px-4 flex flex-col gap-6">
        <div className="text-2xl font-bold">Login</div>
        <Formik
          initialValues={{ username: '', password: '' }}
          validate={(values) => {
            const errors: any = {};
            if (!values.username) {
              errors.username = 'Required';
            }
            if (!values.password) {
              errors.password = 'Required';
            }
            return errors;
          }}
          onSubmit={(values) => {
            loginMutataion.mutate({
              username: values.username,
              password: values.password,
            });
          }}
        >
          {({ values, handleChange, handleSubmit, errors }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div>
                <label
                  className="block mb-2 flex flex-row gap-2"
                  htmlFor="username"
                >
                  <div className="text-gray-700 text-sm font-bold">
                    Username
                  </div>
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-600 text-sm"
                  />
                </label>
                <input
                  className={
                    errors.username
                      ? 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ring-2 ring-red-600'
                      : 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  }
                  id="username"
                  type="text"
                  placeholder="username"
                  onChange={handleChange}
                  value={values.username}
                />
              </div>
              <div>
                <label
                  className="block mb-2 flex flex-row gap-2"
                  htmlFor="password"
                >
                  <div className="text-gray-700 text-sm font-bold">
                    Password
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 text-sm"
                  />
                </label>
                <input
                  className={
                    errors.password
                      ? 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ring-2 ring-red-600'
                      : 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  }                  id="password"
                  type="password"
                  placeholder="********"
                  onChange={handleChange}
                  value={values.password}
                />
              </div>
              <div className="flex items-center justify-between self-end">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline active:ring-blue-300 active:ring-2"
                  type="submit"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
