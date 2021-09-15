import axios from 'axios';
import { Fragment, useState } from 'react';
import { useHistory } from 'react-router';
import { Tab } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';

export function SubmitPostPage() {
  const history = useHistory();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<any>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  return (
    <div className="sm:mx-2">
      <div className="sm:border sm:rounded bg-white sm:mx-auto max-w-4xl py-4 px-2 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            axios
              .post('/api/posts', {
                title,
                body,
                url,
              })
              .then((res) => {
                history.push(`/p/${res.data.id}`);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          <div className="flex flex-col gap-2 max-w-xl mx-auto">
            <div className="text-2xl">New Post</div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-2 rounded p-1 w-full max-w-xl"
              />
            </div>
            <div className="flex flex-col">
              <Tab.Group>
                <Tab.List className="w-full flex flex-row">
                  {['Text', 'Link' /* "Image" */].map((type) => (
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`${
                            selected ? 'bg-gray-100' : ''
                          } rounded-t px-2 py-1 border-l-2 border-t-2 border-r-2`}
                        >
                          {type}
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <textarea
                      id="body"
                      name="body"
                      placeholder="Body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="border-2 rounded-br rounded-bl rounded-tr py-1 px-2 w-full max-w-xl"
                    />
                  </Tab.Panel>
                  <Tab.Panel>
                    <input
                      id="url"
                      name="url"
                      placeholder="URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="border-2 rounded-br rounded-bl rounded-tr py-1 px-2 w-full max-w-xl"
                    />
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="border-2 rounded-br rounded-bl rounded-tr py-1 px-2 w-full max-w-xl flex flex-col">
                      <div className="rounded-lg border-dotted border-2 text-center py-4 px-2 bg-gray-50 my-1">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <div>
                            Drag 'n' drop some files here, or click to select
                            files
                          </div>
                        </div>
                      </div>
                      {files.length > 0 && (
                        <div className="flex flex-row flex-wrap justify-center gap-2 my-1">
                          {files.map((file: any) => (
                            <div
                              key={file.name}
                              className="w-24 h-24 bg-gray-50 rounded border flex items-center justify-center"
                            >
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="max-w-20 max-h-20 border border-black"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* <aside style={thumbsContainer}>{thumbs}</aside> */}
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline active:ring-blue-300 active:ring-2"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
