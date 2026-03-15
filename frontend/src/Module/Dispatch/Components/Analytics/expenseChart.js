import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function ExpenseChart({ expenses }) {

    const grouped = {};

    // ✅ Use correct field name 'type' from backend
    expenses.forEach(e => {
        grouped[e.type] = (grouped[e.type] || 0) + e.amount;
    });

    const data = {
        labels: Object.keys(grouped),
        datasets: [
            {
                label: "Expenses by Type",
                data: Object.values(grouped),
                backgroundColor: "rgba(59,130,246,0.6)"
            }
        ]
    };

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
            <h4>📈 Expense Analytics</h4>
            <Bar data={data} />
        </div>
    );
}

export default ExpenseChart;
