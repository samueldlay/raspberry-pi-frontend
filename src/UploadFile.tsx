import { Button } from "@nextui-org/react";
import { ReactElement, useState } from "react";
import { useAuth } from "./Authentication";
import { getFiles, downloadFile, removeFile } from "./fetchAPI";

function truncate(str: string) {
  const split = str.split(".");
  const extension = split.pop();
  const joined = split.join(".");
  const trunc = joined.slice(0, 20);
  return `${trunc}${trunc.length >= 20 ? "(trunc)" : ""}.${extension}`;
}

export default function UploadFile(): ReactElement {
  const auth = useAuth();
  const { files, setFiles } = getFiles("/api/files");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    if (!auth || !auth.user) throw new Error("Not logged in");

    const formData = new FormData();
    formData.append("file", selectedFile);
    // UP NEXT: UPDATE FILES AFTER UPLOAD
    try {
      const serverURL = import.meta.env.PROD
        ? window.location.href
        : import.meta.env.VITE_SERVER;
      const url = new URL("/api/upload", serverURL);
      // const url = new URL("https://10.0.0.96:8080/api/upload");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
        mode: "cors",
        body: formData,
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = (await response.json()) as string[];

      setSelectedFile(null); // TODO: update file state
      setFiles(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("ERROR:", error.message);
      } else {
        console.error("Error uploading file:", error);
      }
    }
  };

  if (!auth?.user) return <p>You must be logged in to upload</p>;

  return (
    <div className="flex flex-col pb-20">
      <form className="flex flex-col items-center gap-4" onSubmit={handleUpload}>
        <h2>Upload File</h2>
        {/* <Input type="file" onChange={handleFileChange} /> */}
        <label htmlFor="image_uploads">Choose images to upload (PNG, JPG)</label>
        <input name="image_uploads" id="image_uploads" style={{ background: selectedFile ? "lawngreen" : "salmon" }} className="bg-red-400 rounded-lg" placeholder="test" type="file" onChange={handleFileChange} />
        <Button className="w-72" type="submit">
          Upload
        </Button>
      </form>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl">
          {files.length ? "Files:" : "No files in this directory"}
        </h1>
        <ul className="flex flex-col gap-4">
          {files?.map((file, index) => (
            <li className="flex text-xl flex-col md:flex-row gap-2" key={file}>
              {index + 1}.) {truncate(file)}
              <Button
                onClick={async () =>
                  // biome-ignore lint/style/noNonNullAssertion: <Biome is wrong>
                  await downloadFile({ file, user: auth.user! })
                }
              >
                Download
              </Button>
              <Button
                onClick={async () =>
                  // biome-ignore lint/style/noNonNullAssertion: <Biome is wrong>
                  await removeFile({ file, user: auth.user!, setFiles })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
