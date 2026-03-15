// // src/Module/Dispatch/Components/Expense/ExpenseTable.js
// import React from "react";
//
// function ExpenseTable({ expenses }) {
//     if (!expenses || expenses.length === 0) {
//         return <p>No expenses recorded for this vehicle.</p>;
//     }
//
//     return (
//         <div style={{ marginTop: "20px", background: "white", padding: "20px" }}>
//             <h4>Expense Details</h4>
//
//             <table border="1" width="100%" cellPadding="10">
//                 <thead>
//                 <tr>
//                     <th>ID</th>
//                     <th>Type</th>
//                     <th>Description</th>
//                     <th>Amount</th>
//                     <th>Date</th>
//                 </tr>
//                 </thead>
//
//                 <tbody>
//                 {expenses.map((expense) => (
//                     <tr key={expense.id}>
//                         <td>{expense.id}</td>
//                         <td>{expense.expenseType}</td>
//                         <td>{expense.description}</td>
//                         <td>{expense.amount.toFixed(2)}</td>
//                         <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
//                     </tr>
//                 ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
//
// export default ExpenseTable;


import React from "react";

function ExpenseTable({ expenses }) {
    if (!expenses || expenses.length === 0) {
        return <p>No expenses recorded for this vehicle.</p>;
    }

    return (
        <div style={{ marginTop: "20px", background: "white", padding: "20px" }}>
            <h4>Expense Details</h4>

            <table border="1" width="100%" cellPadding="10">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                </tr>
                </thead>

                <tbody>
                {expenses.map((expense) => (
                    <tr key={expense.id}>
                        <td>{expense.id}</td>
                        <td>{expense.type}</td> {/* ✅ changed */}
                        <td>{expense.description}</td>
                        <td>{expense.amount.toFixed(2)}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td> {/* ✅ changed */}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default ExpenseTable;
