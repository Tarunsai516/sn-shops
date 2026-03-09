import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-indigo-950"></div>

      {/* Glow circles */}
      <div className="absolute w-96 h-96 bg-indigo-600 rounded-full blur-[140px] opacity-30 top-[-80px] left-[-80px]"></div>

      <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-[140px] opacity-30 bottom-[-80px] right-[-80px]"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-gray-900/70 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-10 w-96">

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          SN Shops
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Manage your shop efficiently
        </p>

        <form className="space-y-4">

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
            Login
          </button>

        </form>

        <p className="text-gray-400 text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Signup
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;