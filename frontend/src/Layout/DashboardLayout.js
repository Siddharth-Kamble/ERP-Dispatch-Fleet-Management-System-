import React from "react";

function DashboardLayout({ sidebar, children, header }) {
    return (
        <div style={{ display: "flex", height: "100vh", background: "#f1f5f9" }}>

            {/* Sidebar */}
            <aside
                style={{
                    width: "250px",
                    background: "#1f2937",
                    color: "#fff",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {sidebar}
            </aside>

            {/* Right side */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                {header && (
                    <header
                        style={{
                            height: "60px",
                            background: "#fff",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 20px",
                            fontWeight: "600",
                        }}
                    >
                        {header}
                    </header>
                )}

                <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
