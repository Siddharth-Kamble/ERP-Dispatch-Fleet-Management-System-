// const BASE = "http://localhost:8080/api/expenses";
//
// const expenseService = {
//     getByVehicle: async (vehicleId) => {
//         const res = await fetch(`${BASE}/vehicle/${vehicleId}`);
//         return res.json();
//     },
//
//     add: async (vehicleId, data) => {
//         const res = await fetch(`${BASE}/add/${vehicleId}`, {
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//             body: JSON.stringify(data)
//         });
//         return res.json();
//     }
// };
//
// export default expenseService;
//
const BASE = `${process.env.REACT_APP_API_URL}/api/expenses`;

const expenseService = {
    getByVehicle: async (vehicleId) => {
        try {
            const res = await fetch(`${BASE}/vehicle/${vehicleId}`);

            if (!res.ok) {
                throw new Error("Failed to fetch expenses");
            }

            return await res.json();
        } catch (error) {
            console.error("Error in getByVehicle:", error);
            throw error;
        }
    },

    // Renamed to match your existing frontend call
    addExpense: async (vehicleId, data) => {
        try {
            const res = await fetch(`${BASE}/add/${vehicleId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                throw new Error("Failed to add expense");
            }

            return await res.json();
        } catch (error) {
            console.error("Error in addExpense:", error);
            throw error;
        }
    }
};

export default expenseService;
