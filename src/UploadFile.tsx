import { Button } from "@nextui-org/react";
import { ReactElement, useState } from "react";
import { useAuth } from "./Authentication";
import { getFiles } from "./fetchAPI";

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
      const serverURL = import.meta.env.PROD ? window.location.href : import.meta.env.VITE_SERVER;
      const url = new URL("/api/upload", serverURL)
      // const url = new URL("https://10.0.0.96:8080/api/upload");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.user.token}`
        },
        mode: "cors",
        body: formData
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json() as string[];

      setSelectedFile(null); // TODO: update file state
      setFiles(data);

    } catch (error) {
      if (error instanceof Error) {
        console.error("ERROR:", error.message);
      }
      else {
        console.error('Error uploading file:', error);
      }
    }
  };

  if (!auth?.user) return (<p>You must be logged in to upload</p>);

  return (
    <div>
      <form className="flex flex-col content-center items-center gap-4" onSubmit={handleUpload}>
        <h2>Upload File</h2>
        {/* <Input type="file" onChange={handleFileChange} /> */}
        <input type="file" id="input" onChange={handleFileChange} />
        <Button className="w-64" type="submit">Upload</Button>
      </form>
      <div className="flex flex-col content-center items-center">
        <h1 className="text-4xl">Files:</h1>
        <ul>
          {
            files?.map((file, index) => <li className="text-xl" key={file}>{index + 1}.) {file}</li>)
          }
        </ul>
      </div>
    </div>
  );
}
