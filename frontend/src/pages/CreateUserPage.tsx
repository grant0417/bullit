import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import useStore from '../Store';
import { ErrorMessage, Formik } from 'formik';
import { QuestionMarkCircleIcon } from '@heroicons/react/solid';

export function CreateUserPage() {
  const history = useHistory();
  const setUser = useStore((state: any) => state.setUsername);

  const createUserMutataion = useMutation(
    async ({
      username,
      password,
      email,
    }: {
      username: string;
      password: string;
      email: string;
    }) => {
      const res = await axios.post('/api/users', {
        username,
        password,
        email,
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        setUser(data.username);
        history.push('/');
      },
    }
  );

  return (
    <div className="sm:mx-2">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl py-2 px-4 flex flex-col gap-6">
        <div className="text-2xl font-bold">Create Account</div>
        <Formik
          initialValues={{ username: '', password: '', email: '' }}
          validate={(values) => {
            const errors: any = {};
            if (values.username.length < 3) {
              errors.username = 'Must be at least 3 characters';
            }

            if (!values.username) {
              errors.username = 'Required';
            }

            if (values.password.length < 8) {
              errors.password = 'Must be at least 8 characters';
            }

            if (!values.password) {
              errors.password = 'Required';
            }

            const emailRegex =
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (values.email && emailRegex.test(values.email)) {
              errors.email = 'Invalid email';
            }

            return errors;
          }}
          onSubmit={(values, { setErrors, setSubmitting }) => {
            axios
              .post('/api/users', {
                username: values.username,
                password: values.password,
                email: values.email,
              })
              .then((res) => {
                setSubmitting(false);
                setUser(res.data.username);
                history.push('/');
              })
              .catch((err) => {
                setSubmitting(false);
                if (err?.response?.data?.details) {
                  setErrors(
                    err?.response?.data?.details.reduce(
                      (
                        acc: { [key: string]: string },
                        cur: {
                          field: string;
                          message: string;
                        }
                      ) => {
                        acc[cur.field] = cur.message;
                        return acc;
                      },
                      {}
                    )
                  );
                }
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
                  className="block mb-2 flex flex-row gap-2 items-center"
                  htmlFor="password"
                >
                  <div className="text-gray-700 text-sm font-bold">
                    Password
                  </div>
                  {/* <div>
                    <QuestionMarkCircleIcon className="text-gray-700 w-4 h-4" />
                  </div> */}
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
                  }
                  id="password"
                  type="password"
                  placeholder="********"
                  onChange={handleChange}
                  value={values.password}
                />
              </div>
              <div>
                <label
                  className="block mb-2 flex flex-row gap-2 items-center"
                  htmlFor="email"
                >
                  <div className="text-gray-700 text-sm">
                    <span className="font-bold">Email</span> (Optional)
                  </div>
                  <div title="You're email will only be used for password recovery">
                    <QuestionMarkCircleIcon className="text-gray-700 w-4 h-4" />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-sm"
                  />
                </label>
                <input
                  className={
                    errors.email
                      ? 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ring-2 ring-red-600'
                      : 'appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  }
                  id="email"
                  type="text"
                  placeholder="email@text.com"
                  onChange={handleChange}
                  value={values.email}
                />
              </div>
              <div className="flex items-center justify-between self-end">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline active:ring-blue-300 active:ring-2"
                  type="submit"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </Formik>{' '}
      </div>
    </div>
  );
}
