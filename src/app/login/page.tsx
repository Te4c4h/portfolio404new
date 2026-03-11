"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(
        `/api/check-username?username=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus("idle");
      return;
    }
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const validateSignUp = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3 || username.length > 20) {
      errors.username = "Username must be 3–20 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username =
        "Only letters, numbers, hyphens, and underscores allowed";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    if (!validateSignUp()) return;
    if (usernameStatus === "taken") {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username is already taken",
      }));
      return;
    }

    setSignUpLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSignUpError(data.error || "Registration failed");
        setSignUpLoading(false);
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSignUpError("Account created but sign-in failed. Please sign in.");
        setMode("signin");
        setSignUpLoading(false);
        return;
      }

      router.push(`/u/${username}/admin`);
    } catch {
      setSignUpError("Something went wrong");
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");

    if (!signInEmail.trim() || !signInPassword) {
      setSignInError("Email and password are required");
      return;
    }

    setSignInLoading(true);
    try {
      const result = await signIn("credentials", {
        email: signInEmail,
        password: signInPassword,
        redirect: false,
      });

      if (result?.error) {
        setSignInError(result.error);
        setSignInLoading(false);
        return;
      }

      // Fetch session to determine redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.isAdmin) {
        router.push("/admin");
      } else {
        router.push(`/u/${session?.user?.username}/admin`);
      }
    } catch {
      setSignInError("Something went wrong");
      setSignInLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl p-8">
        {/* Toggle */}
        <div className="flex mb-8 bg-[#131313] rounded-lg p-1">
          <button
            onClick={() => {
              setMode("signin");
              setFieldErrors({});
              setSignUpError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === "signin"
                ? "bg-[#70E844] text-[#131313]"
                : "text-[#888] hover:text-[#fafafa]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setSignInError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === "signup"
                ? "bg-[#70E844] text-[#131313]"
                : "text-[#888] hover:text-[#fafafa]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignIn}
              className="space-y-4"
            >
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="auth-input"
                />
              </div>

              {signInError && (
                <p className="text-[#FE454E] text-sm">{signInError}</p>
              )}

              <button
                type="submit"
                disabled={signInLoading}
                className="w-full py-3 bg-[#70E844] text-[#131313] font-semibold rounded-lg hover:bg-[#5ed636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signInLoading ? "Signing in..." : "Sign In"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignUp}
              className="space-y-4"
            >
              {/* First Name / Last Name side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFieldErrors((p) => ({ ...p, firstName: "" }));
                    }}
                    className="auth-input"
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[#FE454E] text-xs mt-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setFieldErrors((p) => ({ ...p, lastName: "" }));
                    }}
                    className="auth-input"
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[#FE454E] text-xs mt-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  className="auth-input"
                />
                {fieldErrors.email && (
                  <p className="text-[#FE454E] text-xs mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Username with availability indicator */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setFieldErrors((p) => ({ ...p, username: "" }));
                    }}
                    className="auth-input pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <svg
                        className="animate-spin h-4 w-4 text-[#888]"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {usernameStatus === "available" && (
                      <svg
                        className="h-4 w-4 text-[#70E844]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {usernameStatus === "taken" && (
                      <svg
                        className="h-4 w-4 text-[#FE454E]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                {fieldErrors.username && (
                  <p className="text-[#FE454E] text-xs mt-1">
                    {fieldErrors.username}
                  </p>
                )}
                {usernameStatus === "taken" && !fieldErrors.username && (
                  <p className="text-[#FE454E] text-xs mt-1">
                    Username is already taken
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  className="auth-input"
                />
                {fieldErrors.password && (
                  <p className="text-[#FE454E] text-xs mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  className="auth-input"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[#FE454E] text-xs mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {signUpError && (
                <p className="text-[#FE454E] text-sm">{signUpError}</p>
              )}

              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full py-3 bg-[#70E844] text-[#131313] font-semibold rounded-lg hover:bg-[#5ed636] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signUpLoading ? "Creating account..." : "Sign Up"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
