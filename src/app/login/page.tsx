"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // If already signed in (e.g. after Google OAuth), redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.username) {
      router.push(`/u/${session.user.username}/admin`);
    }
  }, [status, session, router]);

  // Detect OAuth errors and signup completion from query params
  const oauthError = searchParams.get("error");
  const signupComplete = searchParams.get("signup") === "complete";

  // After Google signup completion, auto-trigger Google sign-in silently (no account picker)
  useEffect(() => {
    if (signupComplete && status !== "authenticated" && status !== "loading") {
      signIn("google", { callbackUrl: "/login", prompt: "none" });
    }
  }, [signupComplete, status]);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState(oauthError === "OAuthCallback" ? "Google sign-in failed. Please try again." : "");
  const [signInLoading, setSignInLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

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

  const [signUpSuccess, setSignUpSuccess] = useState(false);

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

      setSignUpSuccess(true);
      setSignUpLoading(false);
    } catch {
      setSignUpError("Something went wrong");
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setUnverifiedEmail("");

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
        if (result.error === "UNVERIFIED") {
          setUnverifiedEmail(signInEmail);
          setSignInError("");
        } else {
          setSignInError(result.error);
        }
        setSignInLoading(false);
        return;
      }

      // Fetch session to determine redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      router.push(`/u/${session?.user?.username}/admin`);
    } catch {
      setSignInError("Something went wrong");
      setSignInLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setResendSuccess(false);
    try {
      await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setResendSuccess(true);
    } catch {
      // silent fail
    }
    setResendingVerification(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    if (!forgotEmail.trim()) {
      setForgotError("Email is required");
      return;
    }
    setForgotLoading(true);
    try {
      const r = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (r.ok) {
        setForgotMessage("If that email exists, a reset link has been sent. Check your inbox.");
      } else {
        setForgotError("Something went wrong");
      }
    } catch {
      setForgotError("Something went wrong");
    }
    setForgotLoading(false);
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/login" }); // redirects back here, then useEffect above sends to dashboard
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <a
        href="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--border)]/20 transition-colors shadow-sm"
      >
        <FiArrowLeft size={16} />
        Back to Home
      </a>
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
        {/* Toggle */}
        <div className="flex mb-8 bg-[var(--background)] rounded-lg p-1">
          <button
            onClick={() => {
              setMode("signin");
              setFieldErrors({});
              setSignUpError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === "signin"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
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
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 mb-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[var(--muted-foreground)] text-xs">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-[var(--foreground)] font-medium text-center mb-4">Reset your password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="auth-input"
                />
                {forgotError && <p className="text-[var(--danger)] text-sm">{forgotError}</p>}
                {forgotMessage && <p className="text-[var(--accent)] text-sm">{forgotMessage}</p>}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <button
                onClick={() => { setShowForgotPassword(false); setForgotMessage(""); setForgotError(""); }}
                className="w-full mt-3 text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
              >
                Back to sign in
              </button>
            </motion.div>
          ) : mode === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {unverifiedEmail ? (
                <div className="text-center space-y-3">
                  <p className="text-[var(--foreground)] text-sm">Please verify your email. Check your inbox.</p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    className="px-4 py-2 bg-[var(--border)] text-[var(--foreground)] rounded-lg text-sm hover:bg-[var(--border)] disabled:opacity-50"
                  >
                    {resendingVerification ? "Sending..." : "Resend verification email"}
                  </button>
                  {resendSuccess && <p className="text-[var(--accent)] text-xs">Verification email sent!</p>}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block mx-auto text-[var(--muted)] text-xs hover:text-[var(--foreground)]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
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
                    <p className="text-[var(--danger)] text-sm">{signInError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signInLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {signUpSuccess ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-[var(--accent)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[var(--foreground)] font-medium">Account created!</p>
                  <p className="text-[var(--muted)] text-sm">Please check your email to verify your account, then sign in.</p>
                  <button
                    onClick={() => { setMode("signin"); setSignUpSuccess(false); }}
                    className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)]"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
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
                        <p className="text-[var(--danger)] text-xs mt-1">
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
                        <p className="text-[var(--danger)] text-xs mt-1">
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
                      <p className="text-[var(--danger)] text-xs mt-1">
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
                            className="animate-spin h-4 w-4 text-[var(--muted)]"
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
                            className="h-4 w-4 text-[var(--accent)]"
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
                            className="h-4 w-4 text-[var(--danger)]"
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
                      <p className="text-[var(--danger)] text-xs mt-1">
                        {fieldErrors.username}
                      </p>
                    )}
                    {usernameStatus === "taken" && !fieldErrors.username && (
                      <p className="text-[var(--danger)] text-xs mt-1">
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
                      <p className="text-[var(--danger)] text-xs mt-1">
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
                      <p className="text-[var(--danger)] text-xs mt-1">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {signUpError && (
                    <p className="text-[var(--danger)] text-sm">{signUpError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={signUpLoading}
                    className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signUpLoading ? "Creating account..." : "Sign Up"}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
