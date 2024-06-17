import { useState } from "react";
import { Input, Button } from "@nextui-org/react";

export default function CreateAccount() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resultData, setResultData] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    setPasswordError(false);
    ev.preventDefault();
    if (user.password && user.confirmPassword && user.email) {
      if (user.password !== user.confirmPassword) {
        setPasswordError(true);
        return;
      }
      try {
        const res = await fetch("https://10.0.0.96:8080/createAccount", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...user }),
        });
        const result = await res.json() as { message: string, userID: string, email: string };
        console.log(result);
        localStorage.setItem("raspi-user", result.userID);
        setResultData(JSON.stringify(result));
      } catch (exc) {
        if (exc instanceof Error) {
          console.error(exc.message);
        } else console.error(exc);
      }
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    console.log({ value, name })
    setUser((user) => {
      return { ...user, [name]: value };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-1/2 flex flex-col gap-4 items-center">
      <Input
        onChange={handleInput}
        name="email"
        value={user.email}
        variant="underlined"
        placeholder="email"
        label={"Email"}
        isRequired
        type="email"
      />
      <Input
        onChange={handleInput}
        isInvalid={passwordError}
        errorMessage="Password doesn't match"
        name="password"
        value={user.password}
        variant="underlined"
        placeholder="password"
        label={"Password"}
        isRequired
        type="password"
      />
      <Input
        onChange={handleInput}
        isInvalid={passwordError}
        errorMessage="Password doesn't match"
        name="confirmPassword"
        value={user.confirmPassword}
        variant="underlined"
        placeholder="password"
        label={"Confirm password"}
        isRequired
        type="password"
      />
      <Button className="w-48" type="submit" size="lg">
        Create Account
      </Button>
      {resultData ? <h2>{resultData}</h2> : null}
    </form>
  );
}
