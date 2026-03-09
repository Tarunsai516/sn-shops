import { Link } from "react-router-dom";

function Signup() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 overflow-hidden">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-indigo-950"></div>

      {/* Animated Glow Blobs */}
      <div className="absolute w-96 h-96 bg-indigo-600 rounded-full blur-[140px] opacity-30 top-[-80px] left-[-80px] blob-animation"></div>

      <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-[140px] opacity-30 bottom-[-80px] right-[-80px] blob-animation"></div>

      {/* Signup Card */}
      <div className="relative z-10 bg-gray-900/70 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-10 w-96 transition hover:scale-[1.02]">

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Start managing your shop today
        </p>

        <form className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-semibold">
            Signup
          </button>

        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;