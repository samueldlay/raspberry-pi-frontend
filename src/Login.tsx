
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./Authentication";

export default function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";


  const handleSubmitForm = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (user.password && user.email) {
      try {
        const serverURL = import.meta.env.PROD ? window.location.href : import.meta.env.VITE_SERVER;
        const url = new URL("/api/login", serverURL)
        const res = await fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        if (!res.ok) throw new Error("BIG PROBLEM");
        const data = await res.json() as { result: boolean, userID: string, email: string, token: string, mapped: string[] };
        console.log(data);
        if (data.result === true) {
          auth?.signin(data, () => {
            localStorage.setItem("raspi-user", JSON.stringify({ userID: data.userID, email: data.email, token: data.token }));
            navigate(from, { replace: true });
          });
        } else throw new Error("Not verified")
      } catch (exc) {
        if (exc instanceof Error) {
          console.error(exc.message);
        }
        console.error(JSON.stringify(exc));
      }
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, placeholder } = event.target;
    setUser((user) => {
      return { ...user, [placeholder]: value };
    });
  };

  if (auth?.user?.token) return <Navigate to={"/"} replace />; // resolve this component update issue

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
    </form>
  );
}
