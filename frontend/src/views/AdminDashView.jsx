import { useEffect, useState } from "react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const text = await res.text();
        const data = JSON.parse(text);
        setUsers(data);
      } catch (err) {
        console.error("Error while getting the clients:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h3>Korisnici</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={selectedUser?._id === user._id ? "active" : ""}
            >
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-view">
        {selectedUser ? (
          <>
            <h2>{selectedUser.name}</h2>
            <p>Email: {selectedUser.email}</p>
            <p>Planovi: {selectedUser.plans?.length || 0}</p>

            {/* Form for adding the plan */}
            <form>
              <h3>Dodaj novi plan</h3>
              <label>
                Naziv plana:
                <input type="text" />
              </label>
              <label>
                Tjedan:
                <input type="number" min="1" />
              </label>
              <button type="submit">Spremi plan</button>
            </form>
          </>
        ) : (
          <p>Odaberi korisnika s lijeve strane.</p>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
