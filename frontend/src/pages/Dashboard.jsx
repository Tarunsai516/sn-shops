import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        Welcome to SN Shops Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          Total Sales
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          Total Expenses
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow">
          Profit
        </div>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;