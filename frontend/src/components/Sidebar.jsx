import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-5">

      <h1 className="text-2xl font-bold mb-10 text-indigo-400">
        SN Shops
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard" className="hover:text-indigo-400">
          Dashboard
        </Link>

        <Link to="#" className="hover:text-indigo-400">
          Sales
        </Link>

        <Link to="#" className="hover:text-indigo-400">
          Expenses
        </Link>

        <Link to="#" className="hover:text-indigo-400">
          Products
        </Link>

        <Link to="#" className="hover:text-indigo-400">
          Reports
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;