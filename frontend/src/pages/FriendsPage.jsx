import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchUsers, getFriends, sendFriendRequest, acceptFriendRequest, removeFriend } from "../services/api";

export default function FriendsPage() {
  const [friendsData, setFriendsData] = useState({ friends: [], pending: [], sent: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
      const data = await getFriends();
      setFriendsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (id) => {
    try {
      await sendFriendRequest(id);
      alert("Request sent!");
      fetchFriends();
    } catch (e) {
      alert(e.response?.data?.error || "Error sending request");
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id);
      fetchFriends();
    } catch (e) {
      alert(e.response?.data?.error || "Error accepting request");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await removeFriend(id);
      fetchFriends();
    } catch (e) {
      alert(e.response?.data?.error || "Error removing");
    }
  };

  if (loading) return <div className="page-wide" style={{padding: "2rem"}}>Loading friends...</div>;

  return (
    <div className="page-wide" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <h2>👥 Friends & Connections</h2>

      {/* Search Section */}
      <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px" }}>
        <h3>Find Users</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <input 
            type="text" 
            placeholder="Search by username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="p-btn-rem" style={{ background: "var(--accent-teal)" }}>Search</button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {searchResults.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "var(--surface-light)", borderRadius: "8px" }}>
                <span>{u.username}</span>
                <button onClick={() => handleAdd(u.id)} className="p-btn-rem" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>Add Friend</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Pending Requests */}
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3>Pending Requests</h3>
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {friendsData.pending.length === 0 && <p style={{ color: "var(--text-sec)" }}>No pending requests.</p>}
            {friendsData.pending.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "var(--surface-light)", borderRadius: "8px" }}>
                <span>{u.username}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleAccept(u.id)} className="p-btn-rem" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "var(--accent-teal)" }}>Accept</button>
                  <button onClick={() => handleRemove(u.id)} className="p-btn-rem" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "var(--danger)" }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Friends */}
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "12px" }}>
          <h3>My Friends</h3>
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {friendsData.friends.length === 0 && <p style={{ color: "var(--text-sec)" }}>No friends yet.</p>}
            {friendsData.friends.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "var(--surface-light)", borderRadius: "8px" }}>
                <Link to={`/profile/${u.id}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: "bold" }}>
                  {u.username}
                </Link>
                <button onClick={() => handleRemove(u.id)} className="p-btn-rem" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "var(--danger)" }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
