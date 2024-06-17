import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { fakeAuthProvider } from "./auth";
import UploadFile from "./UploadFile";
import Login from "./Login";
import { useState } from "react";
import CreateAccount from "./CreateAccount";

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

interface AuthContextType {
  user: { email: string, userID: string, token: string, files: string[] } | null;
  signin: (user: { email: string, userID: string, token: string, files: string[] }, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

function AuthStatus() {
  const auth = useAuth();

  if (!auth?.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {auth.user.email}!{" "}
    </p>
  );
}
// Next: handle signout request
function Layout() {
  const auth = useAuth();
  return (
    <div>
      <AuthStatus />
      <ul>
        {!auth?.user ? (
          <li>
            <Link to="/login">Log into your account</Link>
          </li>
        ) : <li><Link onClick={() => auth.signout(() => localStorage.removeItem("raspi-user"))} to="/">Sign out</Link></li>}
        <li>
          <Link to="/createAccount">Create an account</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const storedUser = localStorage.getItem("raspi-user");

  if (!storedUser && !auth?.user) {
    console.log("no user stored");
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname ?? "/";

  const [error, setError] = useState(false);

  function handleSubmit(
    data: { result: boolean; userID: string; email: string; token: string; files: string[] } | string,
  ) {
    if (typeof data === "object" && "result" in data && data.result === true) {
      auth?.signin(data, () => {
        // Send them back to the page they tried to visit when they were
        // redirected to the login page. Use { replace: true } so we don't create
        // another entry in the history stack for the login page.  This means that
        // when they get to the protected page and click the back button, they
        // won't end up back on the login page, which is also really nice for the
        // user experience.
        localStorage.setItem("raspi-user", JSON.stringify({ userID: data.userID, email: data.email, token: data.token }));
        navigate(from, { replace: true });
      });
    } else setError(true);
  }

  return (
    <>
      <Login handleSubmit={handleSubmit} />
      {error ? <h1>BIG PROBLEM LOGGING IN!</h1> : null}
    </>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ email: string, userID: string, token: string, files: string[] } | null>(null);

  React.useEffect(() => {
    if (localStorage.getItem("raspi-user")) {
      const user = localStorage.getItem("raspi-user");
      if (user) {
        const parsedUser = JSON.parse(user);
        console.log({ parsedUser });
        setUser(parsedUser);
      }
    }
  }, []);

  const signin = (newUser: { email: string, userID: string, token: string, files: string[] }, callback: VoidFunction) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  const signout = (callback: VoidFunction) => {
    return fakeAuthProvider.signout(() => {
      // make request to server to sign out
      setUser(null);
      callback();
    });
  };

  // const value = { user, signin, signout };

  return <AuthContext.Provider value={{ user, signin, signout }}>{children}</AuthContext.Provider>;
}

export default function AuthMain() {
  return (
    <AuthProvider>
      <h1>Auth Example</h1>
      <Routes>
        <Route element={<Layout />}>
          {/* <Route path="/" element={<PublicPage />} /> */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <UploadFile />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/createAccount" element={<CreateAccount />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
