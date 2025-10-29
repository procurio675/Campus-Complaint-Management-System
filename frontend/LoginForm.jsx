import { useState } from "react";
// We remove imports for Button, Input, and Card components as they are missing.
import { toast } from "sonner";

export function LoginForm({ role, onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.message ||
          (response.status === 401
            ? "Invalid email or password."
            : "Login failed. Please try again.");
        throw new Error(message);
      }

      if (data.role !== role) {
        throw new Error(
          `Login failed. This account is not registered as a '${role}'.`
        );
      }

      toast.success(`Welcome ${data.name}!`);
      onLogin(data);
    } catch (error) {
      toast.error(error.message || "Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Base classes for our replacement input
  const inputClasses =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  // Base classes for our replacement buttons
  const buttonBaseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";

  return (
    // Replaced <Card> with a styled <div>
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Replaced <CardHeader> with a styled <div> */}
      <div className="p-6">
        {/* Replaced <CardTitle> with a styled <h2> */}
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Login as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>
      </div>
      {/* Replaced <CardContent> with a styled <div> */}
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            {/* Replaced <Input> with a styled <input> */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            {/* Replaced <Input> with a styled <input> */}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={inputClasses}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            {/* Replaced <Button> with a styled <button> */}
            <button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className={`${buttonBaseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
            >
              Back
            </button>
            {/* Replaced <Button> with a styled <button> */}
            <button
              type="submit"
              className={`${buttonBaseClasses} flex-1 bg-blue-600 text-white hover:bg-blue-700`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
