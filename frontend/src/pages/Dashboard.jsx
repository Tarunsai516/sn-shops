import DashboardLayout from "../layouts/DashboardLayout";
import SalesChart from "../components/SalesChart";

function Dashboard() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">₹25,000</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Total Expenses</h3>
          <p className="text-2xl font-bold mt-2">₹12,000</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          <h3 className="text-gray-400">Profit</h3>
          <p className="text-2xl font-bold mt-2 text-green-400">₹13,000</p>
        </div>

      </div>

      {/* Chart */}
      <SalesChart />

    </DashboardLayout>
  );
}

export default Dashboard;