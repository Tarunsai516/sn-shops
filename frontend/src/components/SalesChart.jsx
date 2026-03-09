import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", sales: 400 },
  { name: "Tue", sales: 300 },
  { name: "Wed", sales: 500 },
  { name: "Thu", sales: 700 },
  { name: "Fri", sales: 600 },
  { name: "Sat", sales: 900 },
  { name: "Sun", sales: 750 }
];

function SalesChart() {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl mb-4">Weekly Sales</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#333" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;