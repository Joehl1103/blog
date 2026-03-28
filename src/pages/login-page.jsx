import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export function LoginPage() {
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/entries";

  if (user) {
    return <Navigate replace to={redirectTo} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    const authAction = isSignUp ? signUp : signIn;
    const { error } = await authAction(email.trim(), password);

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (isSignUp) {
      setStatusMessage("Check your email to confirm your account.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="border border-border/70 bg-[linear-gradient(135deg,_rgba(16,16,16,0.98),_rgba(52,52,52,0.9))] p-8 text-primary-foreground shadow-xl shadow-black/10 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
          Welcome Back
        </p>
        <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Sign in to write and manage your entries.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
          Your editor stays lightweight, but the workflow is still structured:
          authentication, protected editing, and a public reading surface for
          every published entry.
        </p>
      </section>

      <Card className="border-border/70 bg-background/95 shadow-xl shadow-black/5">
        <CardHeader className="space-y-3 p-8 pb-4">
          <CardTitle className="text-2xl">
            {isSignUp ? "Create your account" : "Log in to continue"}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {isSignUp
              ? "Use email and password auth through Supabase."
              : "Return to your editor and pick up where you left off."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-8 pt-2">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                autoComplete="email"
                id="auth-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                id="auth-password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
                type="password"
                value={password}
              />
            </div>

            {errorMessage ? (
              <p className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="border border-border bg-muted/60 px-4 py-3 text-sm text-foreground">
                {statusMessage}
              </p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Submitting..."
                : isSignUp
                  ? "Create account"
                  : "Log in"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button
              className="font-medium text-foreground underline underline-offset-4"
              onClick={() => {
                setErrorMessage("");
                setStatusMessage("");
                setIsSignUp((currentValue) => !currentValue);
              }}
              type="button"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
