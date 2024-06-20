import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { fakeAuthProvider } from "./auth";
import UploadFile from "./UploadFile";
import Login from "./Login";
import CreateAccount from "./CreateAccount";

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

interface AuthContextType {
  user: { email: string, userID: string, token: string, mapped: string[] } | null;
  signin: (user: { email: string, userID: string, token: string, mapped: string[] }, callback: VoidFunction) => void;
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
    <div className="flex flex-col content-center items-center gap-4">
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ email: string, userID: string, token: string, mapped: string[] } | null>(null);

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

  const signin = (newUser: { email: string, userID: string, token: string, mapped: string[] }, callback: VoidFunction) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  const signout = (callback: VoidFunction) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      callback();
    });
  };


  return <AuthContext.Provider value={{ user, signin, signout }}>{children}</AuthContext.Provider>;
}

export default function AuthMain() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <UploadFile />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/createAccount" element={<CreateAccount />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
