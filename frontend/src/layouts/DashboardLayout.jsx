import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-950 min-h-screen text-white">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Navbar />

        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;