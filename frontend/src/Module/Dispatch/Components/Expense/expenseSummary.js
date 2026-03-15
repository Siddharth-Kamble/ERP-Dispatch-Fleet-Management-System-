// import React from "react";
//
// function ExpenseSummary({ expenses }) {
//     // Ensure expenses is always an array
//     const expenseArray = Array.isArray(expenses) ? expenses : [];
//
//     const total = expenseArray.reduce((sum, e) => sum + (e.amount || 0), 0);
//
//     return (
//         <div style={{
//             background: "white",
//             padding: "20px",
//             marginBottom: "20px",
//             borderRadius: "8px"
//         }}>
//             <h4>📊 Expense Summary</h4>
//             <p>Total Expenses: ₹ {total.toFixed(2)}</p>
//             <p>Total Records: {expenseArray.length}</p>
//         </div>
//     );
// }
//
// export default ExpenseSummary;


import React from "react";

function ExpenseSummary({ expenses }) {
    const expenseArray = Array.isArray(expenses) ? expenses : [];

    const total = expenseArray.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <div style={{
            background: "white",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "8px"
        }}>
            <h4>📊 Expense Summary</h4>
            <p>Total Expenses: ₹ {total.toFixed(2)}</p>
            <p>Total Records: {expenseArray.length}</p>
        </div>
    );
}

export default ExpenseSummary;
