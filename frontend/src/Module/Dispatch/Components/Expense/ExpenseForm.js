// // src/Module/Dispatch/Components/Expense/ExpenseForm.js
// import React, { useState } from "react";
// import expenseService from "../../Services/expenseService";
//
// function ExpenseForm({ vehicleId, reloadExpenses }) {
//     const [expenseType, setExpenseType] = useState("FUEL");
//     const [amount, setAmount] = useState("");
//     const [description, setDescription] = useState("");
//     const [date, setDate] = useState("");
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         const expenseData = {
//             type: expenseType,          // ✅ Changed (must match backend field name)
//             amount: parseFloat(amount),
//             description: description,
//             date: date                 // ✅ Changed (must match backend field name)
//         };
//
//         try {
//             await expenseService.addExpense(vehicleId, expenseData);
//             alert("Expense added successfully!");
//
//             // Reset form
//             setExpenseType("FUEL");
//             setAmount("");
//             setDescription("");
//             setDate("");
//
//             // Reload expense list
//             reloadExpenses();
//         } catch (error) {
//             console.error("Error adding expense:", error);
//             alert("Failed to add expense.");
//         }
//     };
//
//     return (
//         <div style={{ marginTop: "20px", background: "white", padding: "20px" }}>
//             <h4>Add Expense</h4>
//
//             <form onSubmit={handleSubmit}>
//                 <label>
//                     Expense Type:
//                     <select
//                         value={expenseType}
//                         onChange={(e) => setExpenseType(e.target.value)}
//                         required
//                     >
//                         <option value="FUEL">Fuel</option>
//                         <option value="SERVICE">Service</option>
//                         <option value="REPAIR">Repair</option>
//                         <option value="TOLL">Toll</option>
//                         <option value="INSURANCE">Insurance</option>
//                         <option value="SALARY">Driver Salary</option>
//                         <option value="OTHER">Other</option>
//                     </select>
//                 </label>
//                 <br /><br />
//
//                 <label>
//                     Amount:
//                     <input
//                         type="number"
//                         step="0.01"
//                         placeholder="Enter amount"
//                         value={amount}
//                         onChange={(e) => setAmount(e.target.value)}
//                         required
//                     />
//                 </label>
//                 <br /><br />
//
//                 <label>
//                     Description:
//                     <input
//                         type="text"
//                         placeholder="Description"
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         required
//                     />
//                 </label>
//                 <br /><br />
//
//                 <label>
//                     Date:
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         required
//                     />
//                 </label>
//                 <br /><br />
//
//                 <button type="submit">Add Expense</button>
//             </form>
//         </div>
//     );
// }
//
// export default ExpenseForm;

// src/Module/Dispatch/Components/Expense/ExpenseForm.js
import React, { useState } from "react";
import expenseService from "../../Services/expenseService";

function ExpenseForm({ vehicleId, reloadExpenses }) {
    // Default date to today in yyyy-MM-dd format
    const today = new Date().toISOString().split("T")[0];

    const [expenseType, setExpenseType] = useState("FUEL");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(today); // changed only this to default today

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ⚡ Keys must match backend entity exactly
        const expenseData = {
            type: expenseType,      // was expenseType → now matches entity
            amount: parseFloat(amount),
            description: description,
            date: date              // was expenseDate → now matches entity
        };

        try {
            // keep your existing service call
            await expenseService.addExpense(vehicleId, expenseData);
            alert("Expense added successfully!");

            // Reset form (same as your code)
            setExpenseType("FUEL");
            setAmount("");
            setDescription("");
            setDate(today); // reset to today

            reloadExpenses(); // existing reload function
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense.");
        }
    };

    return (
        <div style={{ marginTop: "20px", background: "white", padding: "20px" }}>
            <h4>Add Expense</h4>

            <form onSubmit={handleSubmit}>
                <label>
                    Expense Type:
                    <select
                        value={expenseType}
                        onChange={(e) => setExpenseType(e.target.value)}
                        required
                    >
                        <option value="FUEL">Fuel</option>
                        <option value="SERVICE">Service</option>
                        <option value="REPAIR">Repair</option>
                        <option value="TOLL">Toll</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="SALARY">Driver Salary</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>
                <br /><br />

                <label>
                    Amount:
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </label>
                <br /><br />

                <label>
                    Description:
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
                <br /><br />

                <label>
                    Date:
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </label>
                <br /><br />

                <button type="submit">Add Expense</button>
            </form>
        </div>
    );
}

export default ExpenseForm;
