

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function Signup() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);

//   useEffect(() => setMounted(true), []);

//   useEffect(() => {
//     let strength = 0;
//     if (formData.password.length >= 8) strength++;
//     if (/[A-Z]/.test(formData.password)) strength++;
//     if (/[a-z]/.test(formData.password)) strength++;
//     if (/[0-9]/.test(formData.password)) strength++;
//     if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
//     setPasswordStrength(strength);
//   }, [formData.password]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
//       setError("Please fill in all fields");
//       return false;
//     }
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       setError("Invalid email address");
//       return false;
//     }
//     if (formData.password.length < 8) {
//       setError("Password must be at least 8 characters");
//       return false;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match");
//       return false;
//     }
//     return true;
//   };

//   const signup = async () => {
//     if (!validate()) return;

//     setIsLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data?.error || "Signup failed");
//         return;
//       }

//       // Auto login after successful signup
//       const loginRes = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const loginData = await loginRes.json();
      
//       if (loginRes.ok) {
//         localStorage.setItem("token", loginData.token);
//         localStorage.setItem("user", JSON.stringify(loginData.user));
//         setSuccess(true);
//         setTimeout(() => router.push("/"), 1500);
//       } else {
//         setSuccess(true);
//         setTimeout(() => router.push("/auth/login"), 2000);
//       }
//     } catch {
//       setError("Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
//         <div className="text-center">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-4xl animate-bounce">
//             ✅
//           </div>
//           <h1 className="text-4xl font-bold text-white mb-2">Welcome aboard! 🎉</h1>
//           <p className="text-gray-300 text-xl">Taking you to your dashboard...</p>
//           <div className="mt-6">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden">
//       {/* Background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
//         <div
//           className="absolute inset-0 opacity-20"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />
//       </div>

//       {/* Card */}
//       <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
//         <div className="w-full max-w-md backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl">
//           <h1 className="text-3xl font-bold text-white text-center mb-6">
//             Create Account
//           </h1>

//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               signup();
//             }}
//             className="space-y-4"
//           >
//             <input
//               name="name"
//               placeholder="Full Name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white outline-none"
//             />

//             <input
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white outline-none"
//             />

//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white outline-none"
//             />

//             <input
//               type={showConfirmPassword ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Confirm Password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white outline-none"
//             />

//             {error && (
//               <div className="text-sm text-red-300 bg-red-500/20 p-2 rounded">
//                 {error}
//               </div>
//             )}

//             <button
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded text-white font-semibold hover:scale-105 transition"
//             >
//               {isLoading ? "Creating account..." : "Create Account"}
//             </button>
//           </form>

//           <p className="text-center text-gray-300 mt-6">
//             Already have an account?{" "}
//             <Link href="/auth/login" className="text-blue-400 font-semibold">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }







"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email address");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const signup = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-4xl animate-bounce">
            ✅
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome aboard!
          </h1>
          <p className="text-gray-300 text-xl">
            Setting up your workspace…
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-24 left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-24 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT – MARKETING */}
        <div className="hidden lg:flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl space-y-6 animate-fadeIn">
            <h1 className="text-4xl font-bold leading-tight">
              Start writing
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                better replies instantly
              </span>
            </h1>

            <p className="text-lg text-gray-300">
              Join PlainReply and turn any conversation into a clear,
              professional, human response — in seconds.
            </p>

            <ul className="space-y-3 text-gray-300">
              <li>✔ No AI-generated tone</li>
              <li>✔ Built for daily work conversations</li>
              <li>✔ Trusted by professionals</li>
            </ul>
          </div>
        </div>

        {/* RIGHT – SIGNUP CARD */}
        <div className="flex items-center justify-center px-4">
          <div className="w-full max-w-md backdrop-blur-2xl bg-white/10 p-8 rounded-2xl
            border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-slideUp">

            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center
                bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-full">
                
              </div>
              <h1 className="text-2xl font-bold text-white">
                Create your account
              </h1>
              <p className="text-gray-300 text-sm">
                Start using PlainReply
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                signup();
              }}
              className="space-y-4"
            >
              <input
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                text-white outline-none"
              />

              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                text-white outline-none"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                text-white outline-none"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                text-white outline-none"
              />

              {error && (
                <div className="text-sm text-red-300 bg-red-500/20 p-2 rounded">
                  {error}
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r
                from-purple-600 via-fuchsia-500 to-pink-500
                text-white font-semibold hover:scale-[1.02] transition"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-gray-300 mt-6 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-400 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
