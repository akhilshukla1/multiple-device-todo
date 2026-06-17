import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../context/useAuth";
import api from "../api/axios";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { user, setUser } = useAuth();
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!validate() && state === "Sign Up") {
        toast.error("Please fill all the fields");
        return;
      } else {
        let response;
        if (state === "Sign Up") {
          response = await api.post("/user/register", {
            name,
            email,
            password,
          });
          setEmail("");
          setPassword("");
          if (response.status === 200) {
            setState("Login");
            toast.success("User created successfully!");
          }
        } else {
          const response = await api.post("/user/login", {
            email,
            password,
          });
          if (response.status === 200) {
            setUser(response.data.user);
            console.log(response.data.accessToken);
            localStorage.setItem("accessToken", response.data.accessToken);
            await checkAuth();
            toast.success("Logged in successfully!");
            navigate("/home");
          }
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-10 flex flex-col gap-5"
      >
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white text-center">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </h1>
          <p className="text-slate-400 text-sm text-center mt-1">
            {state === "Sign Up"
              ? "Join us today and get started"
              : "Welcome back! Please login"}
          </p>
        </div>

        {state === "Sign Up" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">
              Full name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-emerald-500 transition-all duration-200"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-400">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-emerald-500 transition-all duration-200"
          />
          {errors.email && (
            <p className="text-red-400 text-xs">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-400">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm outline-none focus:border-emerald-500 transition-all duration-200"
          />
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer mt-1"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <p className="text-center text-sm text-slate-500">
          {state === "Sign Up"
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            type="button"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors cursor-pointer"
            onClick={() => {
              setState(state === "Sign Up" ? "Login" : "Sign Up");
              setEmail("");
              setName("");
              setPassword("");
            }}
          >
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
