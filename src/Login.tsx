
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login({ handleSubmit }: { handleSubmit: (result: string | { email: string, userID: string, result: boolean, token: string, files: string[] }) => void }) {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [resultData, setResultData] = useState("");

  const handleSubmitForm = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (user.password && user.email) {
      try {
        const res = await fetch("https://10.0.0.96:8080/login", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        if (!res.ok) throw new Error("BIG PROBLEM");
        const data = await res.json() as { result: boolean, userID: string, email: string, token: string, files: string[] };
        console.log(data);
        setResultData(JSON.stringify(data));
        handleSubmit(data);
      } catch (exc) {
        if (exc instanceof Error) {
          console.error(exc.message);
          handleSubmit(exc.message);
        }
        console.error(JSON.stringify(exc));
        handleSubmit(JSON.stringify(exc));
      }
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, placeholder } = event.target;
    console.log({ value, placeholder })
    setUser((user) => {
      return { ...user, [placeholder]: value };
    });
  };
  return (
    <form onSubmit={handleSubmitForm} className="w-1/2 flex flex-col gap-4 items-center">
      <Input
        onChange={handleInput}
        value={user.email}
        variant="underlined"
        placeholder="email"
        label={"Email"}
        isRequired
        type="email"
      />
      <Input
        onChange={handleInput}
        value={user.password}
        variant="underlined"
        placeholder="password"
        label={"Password"}
        isRequired
        type="password"
      />
      <Button className="w-48" type="submit" size="lg">
        Log In
      </Button>
      <p>Don't have an account?</p><Link style={{ textDecoration: "underline" }} to="/createAccount"> Create an account here!</Link>
      {resultData ? <h2>{resultData}</h2> : null}
    </form>
  );
}
